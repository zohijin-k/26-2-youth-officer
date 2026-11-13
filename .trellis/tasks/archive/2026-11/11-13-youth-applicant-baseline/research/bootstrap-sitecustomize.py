"""Baseline-only operational path guard; no test/engine decision overrides."""
import builtins
import io
import os
import sys

_REPO = '/home/ijin/26-2-youth-applicant'
_ROOT = '/tmp/youth-applicant-baseline-OQ2u7q'
_FORBIDDEN = os.path.join(_REPO, 'engine_v2', 'data')
_raw_open = builtins.open

def _guard(path):
    if isinstance(path, int) or path is None:
        return
    try:
        value = os.path.abspath(os.fsdecode(os.fspath(path)))
    except TypeError:
        return
    if value == _FORBIDDEN or value.startswith(_FORBIDDEN + os.sep):
        with _raw_open(os.path.join(_ROOT, 'blocked-access.log'), 'a') as log:
            log.write(os.environ.get('PYTEST_CURRENT_TEST', 'startup').split('::')[-1] + '\n')
        raise PermissionError('Baseline guard blocked prohibited engine data access')

def _wrap(fn):
    def guarded(path, *args, **kwargs):
        _guard(path)
        return fn(path, *args, **kwargs)
    return guarded

for _name in ('open', 'stat', 'lstat', 'listdir', 'scandir', 'mkdir', 'remove', 'unlink', 'rmdir'):
    setattr(os, _name, _wrap(getattr(os, _name)))
builtins.open = _wrap(builtins.open)
io.open = _wrap(io.open)

# Import only this stdlib-only operational helper before pytest collection.
# Mutable defaults are redirected before any default font path is accessed.
sys.path.insert(0, _REPO)
from pathlib import Path
from engine_v2.tools import fetch_synth_fonts as _fonts
_fonts.FONT_DIR = Path(_ROOT) / 'fonts'
_fonts.font_path.__defaults__ = (_fonts.FONT_DIR,)
_fonts.fetch.__defaults__ = (_fonts.FONT_DIR,)

# External OCR safety checks resolve their configured private-root path even
# for synthetic inputs. Redirect that operational root before consumers import
# it; tests retain their own explicit monkeypatches and all safety assertions.
from engine_v2 import paths as _paths
_paths.PRIVATE_DIR = Path(_ROOT) / 'synthetic-private-root'
