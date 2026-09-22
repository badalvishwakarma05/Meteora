import os
import struct

def po_to_mo(po_path, mo_path):
    with open(po_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    entries = {}
    msgid = None
    msgstr = None
    current_key = None

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if line.startswith('msgid '):
            if msgid is not None and msgstr is not None:
                entries[msgid] = msgstr
            msgid = line[6:].strip().strip('"')
            msgstr = None
            current_key = 'msgid'
        elif line.startswith('msgstr '):
            msgstr = line[7:].strip().strip('"')
            current_key = 'msgstr'
        elif line.startswith('"') and line.endswith('"'):
            val = line[1:-1]
            if current_key == 'msgid':
                msgid += val
            elif current_key == 'msgstr':
                msgstr += val

    if msgid is not None and msgstr is not None:
        entries[msgid] = msgstr

    # Process escapes in msgid and msgstr
    processed = {}
    for k, v in entries.items():
        k_proc = k.encode('utf-8').decode('unicode_escape')
        v_proc = v.encode('utf-8').decode('unicode_escape')
        processed[k_proc] = v_proc

    # Sort keys lexicographically
    keys = sorted(processed.keys())
    
    # Header format
    # magic: 0x950412de
    # revision: 0
    # num_strings: N
    # orig_table_offset: 28
    # trans_table_offset: 28 + N * 8
    # hash_table_size: 0
    # hash_table_offset: 0
    
    num_strings = len(keys)
    orig_table_offset = 28
    trans_table_offset = orig_table_offset + num_strings * 8
    data_offset = trans_table_offset + num_strings * 8

    orig_table = []
    trans_table = []
    data = bytearray()

    current_data_offset = data_offset

    # Compute positions
    for k in keys:
        k_bytes = k.encode('utf-8') + b'\x00'
        orig_table.append((len(k.encode('utf-8')), current_data_offset))
        data.extend(k_bytes)
        current_data_offset += len(k_bytes)

    for k in keys:
        v = processed[k]
        v_bytes = v.encode('utf-8') + b'\x00'
        trans_table.append((len(v.encode('utf-8')), current_data_offset))
        data.extend(v_bytes)
        current_data_offset += len(v_bytes)

    header = struct.pack(
        '<Iiiiiii',
        0x950412de,
        0,
        num_strings,
        orig_table_offset,
        trans_table_offset,
        0,
        0
    )

    mo_bytes = bytearray(header)
    for length, offset in orig_table:
        mo_bytes.extend(struct.pack('<ii', length, offset))
    for length, offset in trans_table:
        mo_bytes.extend(struct.pack('<ii', length, offset))
    mo_bytes.extend(data)

    with open(mo_path, 'wb') as f:
        f.write(mo_bytes)

if __name__ == '__main__':
    locales = ['hi', 'bn', 'or']
    for lang in locales:
        po_file = os.path.join('locale', lang, 'LC_MESSAGES', 'django.po')
        mo_file = os.path.join('locale', lang, 'LC_MESSAGES', 'django.mo')
        if os.path.exists(po_file):
            po_to_mo(po_file, mo_file)
            print(f"Compiled {po_file} -> {mo_file}")
