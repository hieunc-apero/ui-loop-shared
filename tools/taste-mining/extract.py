import json, os, re, sys, glob
root = os.path.expanduser('~/.claude/projects')
out = []
for f in glob.glob(os.path.join(root, '*', '*.jsonl')):
    proj = os.path.basename(os.path.dirname(f))
    sid = os.path.basename(f)[:-6]
    last_assistant = ''
    try:
        lines = open(f, encoding='utf-8', errors='replace').read().splitlines()
    except Exception:
        continue
    for ln in lines:
        try: d = json.loads(ln)
        except Exception: continue
        if d.get('isSidechain'): continue
        t = d.get('type')
        msg = d.get('message') or {}
        if t == 'assistant':
            c = msg.get('content')
            if isinstance(c, list):
                txt = ' '.join(b.get('text','') for b in c if isinstance(b, dict) and b.get('type')=='text')
                if txt.strip(): last_assistant = txt.strip()
            continue
        if t != 'user': continue
        c = msg.get('content')
        parts = []
        imgs = 0
        if isinstance(c, str): parts=[c]
        elif isinstance(c, list):
            for b in c:
                if not isinstance(b, dict): continue
                if b.get('type')=='text': parts.append(b.get('text',''))
                elif b.get('type')=='image': imgs += 1
                elif b.get('type')=='tool_result': parts=None; break
        if parts is None: continue
        txt = '\n'.join(parts)
        txt = re.sub(r'<system-reminder>.*?</system-reminder>', '', txt, flags=re.S)
        txt = re.sub(r'<task-notification>.*?</task-notification>', '', txt, flags=re.S)
        txt = re.sub(r'<(command-[a-z-]+|local-command-[a-z-]+)>.*?</\1>', '', txt, flags=re.S)
        txt = txt.strip()
        if not txt and not imgs: continue
        if txt.startswith('[Request interrupted'): continue
        out.append({'proj':proj,'sid':sid,'ts':d.get('timestamp',''),'imgs':imgs,'text':txt,'prev':last_assistant[-300:]})
json.dump(out, open('user_msgs.json','w',encoding='utf-8'), ensure_ascii=False)
print(len(out), 'user messages')
