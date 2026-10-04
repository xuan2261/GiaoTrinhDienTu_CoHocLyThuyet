"""Validate or export the canonical 100-item Chapter 3 quiz bank.

The former 50-question v1 seed generator predates the v2 bank and would erase
IDs, metadata and 50 items if run again. The canonical, editable source is now
explicitly data/quiz-ch3.json; this compatibility entry point does not rewrite it.

  python tools/gen_quiz_ch1.py                  # validate only
  python tools/gen_quiz_ch1.py --output /tmp/quiz-ch3.json
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/quiz-ch3.json'


def load_bank(path=SOURCE):
    bank = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(bank, dict) or bank.get('schemaVersion') != 2:
        raise ValueError('Chapter 3 source must use quiz schemaVersion 2')
    items = bank.get('items', [])
    if len(items) != 100:
        raise ValueError('Chapter 3 source must preserve all 100 reviewed item slots')
    if [item.get('id') for item in items] != [f'quiz-ch3-{i:03d}' for i in range(1, 101)]:
        raise ValueError('Chapter 3 item IDs/order must remain quiz-ch3-001 through 100')
    for item in items:
        options, answer = item.get('options'), item.get('correct')
        if not isinstance(options, list) or len(options) != 4:
            raise ValueError(f"{item['id']}: expected four choices")
        if type(answer) is not int or not 0 <= answer < len(options):
            raise ValueError(f"{item['id']}: invalid correct answer index")
        if item.get('type') != 'single-choice':
            raise ValueError(f"{item['id']}: expected single-choice")
        for field in ('question', 'explanation', 'feedbackCorrect', 'feedbackWrong'):
            if not isinstance(item.get(field), str) or not item[field].strip():
                raise ValueError(f"{item['id']}: missing {field}")
    return bank


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, help='Optional export destination; cannot be the canonical source')
    args = parser.parse_args()
    try:
        bank = load_bank()
        if args.output:
            if args.output.resolve() == SOURCE.resolve():
                parser.error('Refusing to overwrite the canonical source; edit data/quiz-ch3.json directly')
            args.output.write_text(json.dumps(bank, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
            print(f"Exported {len(bank['items'])} Chapter 3 items to {args.output}")
        else:
            print(f"Validated {len(bank['items'])} Chapter 3 items; canonical source unchanged")
    except (OSError, ValueError) as error:
        parser.error(str(error))


if __name__ == '__main__':
    main()
