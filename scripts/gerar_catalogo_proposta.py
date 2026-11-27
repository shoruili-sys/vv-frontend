#!/usr/bin/env python3
"""Gera src/data/units.json a partir de todos os PDFs de unidades em docs/.

Uso: python3 scripts/gerar_catalogo.py

Cada PDF de tabela de unidades vira um empreendimento no catálogo. A data de
entrega e o prazo máximo de financiamento NÃO são inventados: o PDF informa
apenas o "financiamento previsto", guardado como informação complementar.

Além do catálogo, o script grava docs/catalogo-validacao.txt com o relatório
das inconsistências encontradas (soma das parcelas, área e ids duplicados).
"""
from __future__ import annotations

import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError as exc:  # pragma: no cover - dependência externa
    raise SystemExit("pypdf não encontrado. Instale com: pip install pypdf") from exc

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs" / "proposta"
OUTPUT = ROOT / "app" / "proposta" / "data" / "units.json"
REPORT = DOCS / "catalogo-validacao.txt"

MONEY_TOLERANCE = 0.10
MAX_AREA = 10000.0

ROW = re.compile(
    r"^(?:ETAPA\s+)?(?P<stage>(?:\d{1,3}|[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{1,12}))\s+"
    r"(?P<block>(?:\d{1,3}|[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{1,12}))\s+"
    r"(?P<unit>\d{1,5})\s+"
    r"(?P<area>\d[\d.,]*)\s*m\s*²",
    re.IGNORECASE,
)
MONEY = re.compile(r"R\$\s*(?P<value>\d[\d.,]*)\b", re.IGNORECASE)
PARCELAS_MENSAIS = re.compile(
    r"PARCELAS\s+MENSAIS\s*\(?\s*(\d+)\s*x", re.IGNORECASE | re.DOTALL
)

HEADER_NOISE = re.compile(
    r"tabela|novembro|dezembro|janeiro|fevereiro|março|abril|maio|junho|"
    r"julho|agosto|setembro|outubro|etapa|bloco|unidade|área|valor|sinal|"
    r"comissão|parcelas|financiamento|previsto|versão|v\d+",
    re.IGNORECASE,
)


def to_number(raw: str) -> float:
    value = raw.strip().replace(" ", "")
    if "," in value and "." in value:
        value = value.replace(".", "").replace(",", ".")
    elif "," in value:
        value = value.replace(",", ".")
    elif re.fullmatch(r"\d{1,3}(\.\d{3})+", value):
        value = value.replace(".", "")
    return float(value)


def to_iso_date(raw: str) -> str:
    match = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", raw.strip())
    return f"{match.group(3)}-{match.group(2)}-{match.group(1)}" if match else ""


def money(value: float) -> str:
    """Formata um valor em reais no padrão brasileiro para o relatório."""
    return f"R$ {value:,.2f}".replace(",", "@").replace(".", ",").replace("@", ".")


def development_name(text: str, filename: str) -> str:
    for line in text.splitlines()[:15]:
        # Alguns PDFs juntam o nome do empreendimento com "Tabela:" na mesma linha.
        candidate = re.sub(r"\bTabela:.*$", "", " ".join(line.split()), flags=re.IGNORECASE).strip()
        if (
            len(candidate) >= 4
            and not HEADER_NOISE.search(candidate)
            and not re.fullmatch(r"\d{2}/\d{2}/\d{4}", candidate)
        ):
            return candidate.title()
    return Path(filename).stem.replace("_", " ").title()


def slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def monthly_installments(text: str) -> int:
    """Quantidade de parcelas mensais informada no cabeçaldo (padrão: 1)."""
    match = PARCELAS_MENSAIS.search(text)
    return int(match.group(1)) if match else 1


def parse_pdf(path: Path) -> tuple[dict, list[str]]:
    """Lê um PDF e devolve o empreendimento e os avisos da validação local."""
    text = "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)
    forecast = re.search(r"FINANCIAMENTO\s+PREVISTO.*?(\d{2}/\d{2}/\d{4})", text, re.IGNORECASE | re.DOTALL)
    installments = monthly_installments(text)
    has_commission = bool(re.search(r"COMISS[ÃA]O", text, re.IGNORECASE))

    name = development_name(text, path.name)
    development = {
        "id": slug(name),
        "name": name,
        "city": "",
        "state": "",
        "deliveryDate": "",
        "units": [],
    }
    if forecast:
        development["financingForecast"] = to_iso_date(forecast.group(1))

    warnings: list[str] = []
    seen: set[str] = set()
    for line in text.splitlines():
        normalized = " ".join(line.split())
        match = ROW.match(normalized)
        if not match:
            continue

        block = match.group("block")
        stage = match.group("stage")
        unit = match.group("unit")
        unit_id = f"{block}-{stage}-{unit}"

        raw_area = match.group("area")
        area = to_number(raw_area)
        if area <= 0 or area > MAX_AREA:
            warnings.append(
                f"{path.name}: unidade {unit_id} descartada — área privativa inválida "
                f"({raw_area} m²)"
            )
            continue

        if unit_id in seen:
            warnings.append(
                f"{path.name}: id de unidade {unit_id} duplicado no mesmo PDF "
                f"— segunda ocorrência ignorada"
            )
            continue
        seen.add(unit_id)

        values = [to_number(item) for item in MONEY.findall(normalized)]
        if len(values) >= 5:
            # Colunas: valor total, sinal, comissão, mensal, financiamento.
            # Em tabelas sem comissão, a terceira parcela é a mensal e a
            # quarta (intermediária) ocupa o lugar da comissão.
            total = values[0]
            sinal = values[1]
            if has_commission:
                comissao, mensal = values[2], values[3]
            else:
                mensal, comissao = values[2], values[3]
            financiamento = values[4]
        elif len(values) == 4:
            # Sem coluna "valor total": o total é a soma das parcelas.
            total = None
            sinal, comissao, mensal, financiamento = values
        else:
            warnings.append(
                f"{path.name}: unidade {unit_id} com parcelas incompletas "
                f"({len(values)} valor(es) monetário(s) encontrado(s))"
            )
            sinal, comissao, mensal, financiamento = (values + [0.0] * 4)[:4]
            total = values[0] if values else 0.0

        expected = sinal + comissao + mensal * installments + financiamento
        if total is None:
            total = expected
        if abs(expected - total) > MONEY_TOLERANCE:
            warnings.append(
                f"{path.name}: unidade {unit_id} — valor total {money(total)} difere da "
                f"soma das parcelas {money(expected)} (sinal {money(sinal)} + comissão "
                f"{money(comissao)} + {installments}x {money(mensal)} + financiamento "
                f"{money(financiamento)}; diferença {money(abs(expected - total))})"
            )

        development["units"].append({
            "id": unit_id,
            "block": block,
            "unit": unit,
            "area": round(area, 4),
            "totalPrice": round(total, 2),
        })
    return development, warnings


def write_report(pdfs: list[Path], total_units: int, warnings: list[str], infos: list[str]) -> None:
    lines = [
        "Relatório de validação do catálogo de unidades",
        f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"PDFs processados ({len(pdfs)}):",
    ]
    lines.extend(f"  - {path.name}" for path in pdfs)
    lines.extend([
        f"Total de unidades: {total_units}",
        f"Total de avisos: {len(warnings)}",
        "",
        "Avisos:",
    ])
    if warnings:
        lines.extend(f"  - {warning}" for warning in warnings)
    else:
        lines.append("  Nenhum aviso")
    if infos:
        lines.extend(["", "Informações:"])
        lines.extend(f"  - {info}" for info in infos)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    pdfs = sorted(DOCS.glob("*.pdf"))
    developments: dict[str, dict] = {}
    warnings: list[str] = []
    infos: list[str] = []
    seen_ids: dict[str, tuple[str, float, float]] = {}

    for path in pdfs:
        parsed, pdf_warnings = parse_pdf(path)
        warnings.extend(pdf_warnings)
        if not parsed["units"]:
            warnings.append(f"{path.name}: nenhuma unidade válida encontrada")
            continue

        for unit in parsed["units"]:
            previous = seen_ids.get(unit["id"])
            if previous is None:
                seen_ids[unit["id"]] = (path.name, unit["area"], unit["totalPrice"])
                continue
            previous_pdf, previous_area, previous_price = previous
            if (
                abs(previous_area - unit["area"]) > 1e-4
                or abs(previous_price - unit["totalPrice"]) > 0.01
            ):
                warnings.append(
                    f"id {unit['id']} duplicado entre PDFs ({previous_pdf} e {path.name}): "
                    f"área {previous_area:g}/{unit['area']:g} m² e valor "
                    f"{money(previous_price)}/{money(unit['totalPrice'])} divergem"
                )
            else:
                infos.append(
                    f"id {unit['id']} repetido entre PDFs ({previous_pdf} e {path.name}) "
                    f"com área e valor iguais"
                )

        existing = developments.get(parsed["id"])
        if existing is None:
            developments[parsed["id"]] = parsed
        else:
            known = {unit["id"] for unit in existing["units"]}
            existing["units"].extend(unit for unit in parsed["units"] if unit["id"] not in known)

    total_units = sum(len(item["units"]) for item in developments.values())
    write_report(pdfs, total_units, warnings, infos)

    if not pdfs:
        raise SystemExit(f"Nenhum PDF encontrado em {DOCS}")
    if not developments:
        raise SystemExit("Nenhuma unidade válida foi encontrada nos PDFs.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"developments": list(developments.values())}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"{len(developments)} empreendimento(s), {total_units} unidade(s), "
        f"{len(warnings)} aviso(s) -> {OUTPUT.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
