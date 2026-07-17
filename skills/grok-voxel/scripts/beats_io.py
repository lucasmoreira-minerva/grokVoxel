#!/usr/bin/env python3
"""
Read / write / lightly validate beats.json (single source of truth for a project).

Usage:
  python3 beats_io.py validate <project_dir>
  python3 beats_io.py print <project_dir>
"""
import json
import os
import sys

REQUIRED_TOP = ("project", "topic", "beats")
REQUIRED_BEAT = ("id", "narration")


def load(project_dir: str) -> dict:
    path = os.path.join(project_dir, "beats.json")
    with open(path) as f:
        return json.load(f)


def save(project_dir: str, doc: dict) -> str:
    path = os.path.join(project_dir, "beats.json")
    with open(path, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return path


def validate(doc: dict) -> list[str]:
    errors = []
    for k in REQUIRED_TOP:
        if k not in doc:
            errors.append(f"missing top-level key: {k}")
    if doc.get("aspect") and doc["aspect"] not in ("16:9", "9:16", "1:1", "3:4"):
        errors.append(f"unusual aspect: {doc.get('aspect')}")
    beats = doc.get("beats") or []
    if not beats:
        errors.append("beats array is empty")
    for i, b in enumerate(beats):
        for k in REQUIRED_BEAT:
            if k not in b:
                errors.append(f"beat[{i}] missing {k}")
        shots = b.get("shots")
        if shots is not None and not isinstance(shots, list):
            errors.append(f"beat[{i}].shots must be a list")
        if shots:
            for j, s in enumerate(shots):
                if "id" not in s:
                    errors.append(f"beat[{i}].shots[{j}] missing id")
    return errors


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    cmd, project = sys.argv[1], os.path.abspath(sys.argv[2])
    doc = load(project)
    if cmd == "validate":
        errs = validate(doc)
        if errs:
            print("INVALID:")
            for e in errs:
                print(" -", e)
            sys.exit(1)
        print("OK:", os.path.join(project, "beats.json"), f"({len(doc['beats'])} beats)")
    elif cmd == "print":
        print(json.dumps(doc, indent=2, ensure_ascii=False))
    else:
        print("Unknown command:", cmd, file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
