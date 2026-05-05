<template>
  <div class="app-root">
    <!-- Top Bar -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo-icon">⬡</span>
        <span class="logo-text">DockerForge</span>
        <span class="logo-badge">YAML Builder</span>
      </div>
      <div class="topbar-right">
        <button class="btn-ghost" @click="clearAll">
          <span>✕</span> Clear
        </button>
        <button class="btn-primary" @click="downloadYaml">
          <span>↓</span> Download YAML
        </button>
      </div>
    </header>

    <div class="workspace">
      <!-- LEFT PANEL -->
      <div class="panel panel-left">
        <div class="panel-header">
          <span class="panel-title">Services</span>
          <span class="panel-hint">Drag to canvas</span>
        </div>

        <!-- Service Palette -->
        <div class="palette">
          <div
              v-for="preset in presets"
              :key="preset.id"
              class="palette-item"
              draggable="true"
              @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="palette-icon">{{ preset.icon }}</span>
            <div class="palette-info">
              <span class="palette-name">{{ preset.label }}</span>
              <span class="palette-image">{{ preset.image }}</span>
            </div>
            <span class="palette-drag-hint">⠿</span>
          </div>
        </div>

        <!-- Canvas Drop Zone -->
        <div class="canvas-header">
          <span class="panel-title">Canvas</span>
          <span class="service-count">{{ services.length }} service{{ services.length !== 1 ? 's' : '' }}</span>
        </div>
        <div
            class="canvas"
            :class="{ 'canvas-dragover': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="onCanvasDrop($event)"
        >
          <div v-if="services.length === 0" class="canvas-empty">
            <span class="canvas-empty-icon">⬡</span>
            <p>Drop services here</p>
            <p class="canvas-empty-sub">Build your docker-compose stack</p>
          </div>

          <div
              v-for="(service, index) in services"
              :key="service._uid"
              class="service-card"
              :class="{ 'service-card--active': activeService === service._uid }"
              draggable="true"
              @dragstart="onCardDragStart($event, index)"
              @dragover.prevent="onCardDragOver($event, index)"
              @drop.prevent="onCardDrop($event, index)"
              @click="toggleService(service._uid)"
          >
            <div class="service-card-header">
              <span class="service-icon">{{ service.icon }}</span>
              <input
                  v-model="service.name"
                  class="service-name-input"
                  placeholder="service-name"
                  @click.stop
                  @input="generateYaml"
              />
              <button class="card-remove" @click.stop="removeService(index)">✕</button>
            </div>

            <!-- Expanded Config -->
            <div v-if="activeService === service._uid" class="service-card-body">
              <div class="field-group">
                <label>Image</label>
                <input v-model="service.image" placeholder="nginx:latest" @input="generateYaml" />
              </div>

              <div class="field-group">
                <label>Ports <span class="field-hint">(host:container)</span></label>
                <div v-for="(port, pi) in service.ports" :key="pi" class="field-row">
                  <input v-model="service.ports[pi]" placeholder="8080:80" @input="generateYaml" />
                  <button class="field-remove" @click="service.ports.splice(pi, 1); generateYaml()">✕</button>
                </div>
                <button class="field-add" @click="service.ports.push(''); generateYaml()">+ Add Port</button>
              </div>

              <div class="field-group">
                <label>Environment <span class="field-hint">(KEY=VALUE)</span></label>
                <div v-for="(env, ei) in service.environment" :key="ei" class="field-row">
                  <input v-model="service.environment[ei]" placeholder="NODE_ENV=production" @input="generateYaml" />
                  <button class="field-remove" @click="service.environment.splice(ei, 1); generateYaml()">✕</button>
                </div>
                <button class="field-add" @click="service.environment.push(''); generateYaml()">+ Add Env</button>
              </div>

              <div class="field-group">
                <label>Volumes <span class="field-hint">(host:container)</span></label>
                <div v-for="(vol, vi) in service.volumes" :key="vi" class="field-row">
                  <input v-model="service.volumes[vi]" placeholder="./data:/var/data" @input="generateYaml" />
                  <button class="field-remove" @click="service.volumes.splice(vi, 1); generateYaml()">✕</button>
                </div>
                <button class="field-add" @click="service.volumes.push(''); generateYaml()">+ Add Volume</button>
              </div>

              <div class="field-group">
                <label>Depends On</label>
                <select v-model="service.depends_on" multiple @change="generateYaml" class="field-select">
                  <option v-for="s in services.filter(s => s._uid !== service._uid)" :key="s._uid" :value="s.name">
                    {{ s.name || '(unnamed)' }}
                  </option>
                </select>
              </div>

              <div class="field-group">
                <label>Restart Policy</label>
                <select v-model="service.restart" @change="generateYaml" class="field-select-sm">
                  <option value="">none</option>
                  <option value="always">always</option>
                  <option value="unless-stopped">unless-stopped</option>
                  <option value="on-failure">on-failure</option>
                </select>
              </div>

              <div class="field-group">
                <label>Networks</label>
                <div v-for="(net, ni) in service.networks" :key="ni" class="field-row">
                  <input v-model="service.networks[ni]" placeholder="app-network" @input="generateYaml" />
                  <button class="field-remove" @click="service.networks.splice(ni, 1); generateYaml()">✕</button>
                </div>
                <button class="field-add" @click="service.networks.push(''); generateYaml()">+ Add Network</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="divider">
        <div class="divider-line"></div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="panel panel-right">
        <div class="panel-header">
          <span class="panel-title">docker-compose.yml</span>
          <div class="yaml-actions">
            <span v-if="copied" class="copied-badge">Copied!</span>
            <button class="btn-ghost" @click="copyYaml">
              <span>⎘</span> Copy
            </button>
            <button class="btn-ghost" @click="downloadYaml">
              <span>↓</span> Download
            </button>
          </div>
        </div>

        <div class="yaml-pane">
          <pre class="yaml-output"><code v-html="highlightedYaml"></code></pre>
        </div>

        <!-- Stats bar -->
        <div class="yaml-stats">
          <span>{{ services.length }} services</span>
          <span>•</span>
          <span>{{ uniqueNetworks.length }} network{{ uniqueNetworks.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span>{{ uniqueVolumes.length }} volume{{ uniqueVolumes.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span class="yaml-version">version: "3.8"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ─── Presets ──────────────────────────────────────────────────────────────────
const presets = [
  { id: 'nginx',    label: 'Nginx',      image: 'nginx:alpine',          icon: '🌐', defaultPorts: ['80:80'], defaultEnv: [] },
  { id: 'postgres', label: 'PostgreSQL', image: 'postgres:16-alpine',    icon: '🐘', defaultPorts: ['5432:5432'], defaultEnv: ['POSTGRES_PASSWORD=secret','POSTGRES_DB=app'] },
  { id: 'mysql',    label: 'MySQL',      image: 'mysql:8',               icon: '🐬', defaultPorts: ['3306:3306'], defaultEnv: ['MYSQL_ROOT_PASSWORD=secret','MYSQL_DATABASE=app'] },
  { id: 'redis',    label: 'Redis',      image: 'redis:7-alpine',        icon: '🔴', defaultPorts: ['6379:6379'], defaultEnv: [] },
  { id: 'mongo',    label: 'MongoDB',    image: 'mongo:7',               icon: '🍃', defaultPorts: ['27017:27017'], defaultEnv: ['MONGO_INITDB_ROOT_USERNAME=root','MONGO_INITDB_ROOT_PASSWORD=secret'] },
  { id: 'node',     label: 'Node.js',    image: 'node:20-alpine',        icon: '💚', defaultPorts: ['3000:3000'], defaultEnv: ['NODE_ENV=production'] },
  { id: 'python',   label: 'Python',     image: 'python:3.12-slim',      icon: '🐍', defaultPorts: ['8000:8000'], defaultEnv: [] },
  { id: 'rabbitmq', label: 'RabbitMQ',   image: 'rabbitmq:3-management', icon: '🐰', defaultPorts: ['5672:5672','15672:15672'], defaultEnv: [] },
  { id: 'minio',    label: 'MinIO',      image: 'minio/minio:latest',    icon: '📦', defaultPorts: ['9000:9000','9001:9001'], defaultEnv: ['MINIO_ROOT_USER=admin','MINIO_ROOT_PASSWORD=secret'] },
  { id: 'traefik',  label: 'Traefik',    image: 'traefik:v3',            icon: '🔀', defaultPorts: ['80:80','8080:8080'], defaultEnv: [] },
  { id: 'grafana',  label: 'Grafana',    image: 'grafana/grafana:latest', icon: '📊', defaultPorts: ['3000:3000'], defaultEnv: ['GF_SECURITY_ADMIN_PASSWORD=admin'] },
  { id: 'custom',   label: 'Custom',     image: 'my-image:latest',       icon: '⚙️', defaultPorts: [], defaultEnv: [] },
]

// ─── State ────────────────────────────────────────────────────────────────────
const services       = ref([])
const yamlOutput     = ref('')
const activeService  = ref(null)
const isDragOver     = ref(false)
const copied         = ref(false)
let   dragSource     = null   // 'palette' | 'card'
let   dragPreset     = null
let   dragCardIndex  = null
let   uidCounter     = 0

// ─── Drag from Palette ────────────────────────────────────────────────────────
function onPaletteDragStart(event, preset) {
  dragSource = 'palette'
  dragPreset = preset
  event.dataTransfer.effectAllowed = 'copy'
}

// ─── Drag from Card ───────────────────────────────────────────────────────────
function onCardDragStart(event, index) {
  dragSource    = 'card'
  dragCardIndex = index
  event.dataTransfer.effectAllowed = 'move'
  event.stopPropagation()
}

function onCardDragOver(event, index) {
  if (dragSource === 'card') {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onCardDrop(event, targetIndex) {
  if (dragSource === 'card' && dragCardIndex !== null && dragCardIndex !== targetIndex) {
    const arr  = [...services.value]
    const item = arr.splice(dragCardIndex, 1)[0]
    arr.splice(targetIndex, 0, item)
    services.value = arr
    generateYaml()
  }
  isDragOver.value  = false
  dragCardIndex     = null
  event.stopPropagation()
}

// ─── Drop on Canvas ───────────────────────────────────────────────────────────
function onCanvasDrop(event) {
  isDragOver.value = false
  if (dragSource === 'palette' && dragPreset) {
    addService(dragPreset)
  }
  dragSource  = null
  dragPreset  = null
}

function addService(preset) {
  const countSame = services.value.filter(s => s._baseId === preset.id).length
  const name      = countSame === 0 ? preset.id : `${preset.id}-${countSame + 1}`
  services.value.push({
    _uid:        ++uidCounter,
    _baseId:     preset.id,
    icon:        preset.icon,
    name,
    image:       preset.image,
    ports:       [...preset.defaultPorts],
    environment: [...preset.defaultEnv],
    volumes:     [],
    networks:    [],
    depends_on:  [],
    restart:     '',
  })
  generateYaml()
}

// ─── Service Management ───────────────────────────────────────────────────────
function removeService(index) {
  const removed = services.value.splice(index, 1)[0]
  if (activeService.value === removed._uid) activeService.value = null
  generateYaml()
}

function toggleService(uid) {
  activeService.value = activeService.value === uid ? null : uid
}

function clearAll() {
  services.value      = []
  activeService.value = null
  generateYaml()
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const uniqueNetworks = computed(() => {
  const nets = new Set()
  services.value.forEach(s => s.networks.forEach(n => n && nets.add(n)))
  return [...nets]
})

const uniqueVolumes = computed(() => {
  const vols = new Set()
  services.value.forEach(s =>
      s.volumes.forEach(v => {
        if (v && !v.startsWith('./') && !v.startsWith('/')) {
          const name = v.split(':')[0]
          if (name) vols.add(name)
        }
      })
  )
  return [...vols]
})

// ─── YAML Generation ──────────────────────────────────────────────────────────
function generateYaml() {
  if (services.value.length === 0) {
    yamlOutput.value = '# Drop services onto the canvas\n# to start building your stack'
    return
  }

  const indent = (n, str) => str.split('\n').map(l => ' '.repeat(n) + l).join('\n')
  const lines  = []

  lines.push('version: "3.8"')
  lines.push('')
  lines.push('services:')

  for (const svc of services.value) {
    const name = svc.name || svc._baseId || 'service'
    lines.push(`  ${name}:`)
    lines.push(`    image: ${svc.image || 'undefined'}`)

    const ports = svc.ports.filter(Boolean)
    if (ports.length) {
      lines.push('    ports:')
      ports.forEach(p => lines.push(`      - "${p}"`))
    }

    const envs = svc.environment.filter(Boolean)
    if (envs.length) {
      lines.push('    environment:')
      envs.forEach(e => lines.push(`      - ${e}`))
    }

    const vols = svc.volumes.filter(Boolean)
    if (vols.length) {
      lines.push('    volumes:')
      vols.forEach(v => lines.push(`      - ${v}`))
    }

    const nets = svc.networks.filter(Boolean)
    if (nets.length) {
      lines.push('    networks:')
      nets.forEach(n => lines.push(`      - ${n}`))
    }

    const deps = svc.depends_on.filter(Boolean)
    if (deps.length) {
      lines.push('    depends_on:')
      deps.forEach(d => lines.push(`      - ${d}`))
    }

    if (svc.restart) {
      lines.push(`    restart: ${svc.restart}`)
    }

    lines.push('')
  }

  if (uniqueNetworks.value.length) {
    lines.push('networks:')
    uniqueNetworks.value.forEach(n => {
      lines.push(`  ${n}:`)
      lines.push('    driver: bridge')
    })
    lines.push('')
  }

  if (uniqueVolumes.value.length) {
    lines.push('volumes:')
    uniqueVolumes.value.forEach(v => lines.push(`  ${v}:`))
  }

  yamlOutput.value = lines.join('\n').trimEnd()
}

// ─── Syntax Highlight ─────────────────────────────────────────────────────────
const highlightedYaml = computed(() => {
  return yamlOutput.value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^(#.*)$/gm, '<span class="y-comment">$1</span>')
      .replace(/^(\s*)([\w-]+)(:)/gm, '$1<span class="y-key">$2</span><span class="y-colon">$3</span>')
      .replace(/"([^"]*)"/g, '<span class="y-string">"$1"</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="y-bool">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="y-num">$1</span>')
})

// ─── Clipboard / Download ─────────────────────────────────────────────────────
function copyYaml() {
  navigator.clipboard.writeText(yamlOutput.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}

function downloadYaml() {
  const blob = new Blob([yamlOutput.value], { type: 'text/yaml' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = 'docker-compose.yml'
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => generateYaml())
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap');

:root {
  --bg:          #0d0f14;
  --bg-panel:    #12151d;
  --bg-card:     #181c27;
  --bg-hover:    #1e2333;
  --bg-active:   #1a2035;
  --border:      #252a38;
  --border-lit:  #2e3549;
  --accent:      #00e5ff;
  --accent-dim:  #00b8cc;
  --accent-glow: rgba(0,229,255,0.12);
  --green:       #39ff8e;
  --orange:      #ff9520;
  --red:         #ff4545;
  --txt-1:       #e8ecf5;
  --txt-2:       #8891aa;
  --txt-3:       #525c75;
  --radius:      8px;
  --radius-lg:   12px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.app-root {
  font-family: 'Syne', sans-serif;
  background: var(--bg);
  color: var(--txt-1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Top Bar ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
  flex-shrink: 0;
  z-index: 10;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 22px; color: var(--accent); line-height: 1; }
.logo-text { font-size: 17px; font-weight: 800; letter-spacing: -0.5px; color: var(--txt-1); }
.logo-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--accent-glow);
  border: 1px solid rgba(0,229,255,0.25);
  color: var(--accent);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.topbar-right { display: flex; gap: 8px; }

/* ── Buttons ── */
.btn-ghost {
  display: flex; align-items: center; gap: 6px;
  background: transparent;
  border: 1px solid var(--border-lit);
  color: var(--txt-2);
  padding: 6px 14px;
  border-radius: var(--radius);
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover { color: var(--txt-1); border-color: var(--accent); background: var(--accent-glow); }
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent);
  border: none;
  color: #000;
  padding: 6px 16px;
  border-radius: var(--radius);
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover { background: var(--accent-dim); }

/* ── Workspace ── */
.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 52px);
}

/* ── Panels ── */
.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-left {
  width: 50%;
  border-right: 1px solid var(--border);
  background: var(--bg-panel);
  overflow-y: auto;
}
.panel-right {
  width: 50%;
  background: var(--bg);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.panel-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--txt-2);
}
.panel-hint {
  font-size: 11px;
  color: var(--txt-3);
  font-family: 'JetBrains Mono', monospace;
}
.service-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent);
}

/* ── Divider ── */
.divider { position: relative; width: 0; }
.divider-line {
  position: absolute;
  top: 0; left: -1px;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, var(--accent) 30%, var(--accent) 70%, transparent);
  opacity: 0.2;
}

/* ── Palette ── */
.palette {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  border-bottom: 1px solid var(--border);
}
.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
  cursor: grab;
  transition: all 0.15s;
  user-select: none;
}
.palette-item:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
  box-shadow: 0 0 0 1px var(--accent-glow);
}
.palette-item:active { cursor: grabbing; }
.palette-icon { font-size: 18px; flex-shrink: 0; }
.palette-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.palette-name { font-size: 12px; font-weight: 700; color: var(--txt-1); }
.palette-image { font-size: 10px; color: var(--txt-3); font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.palette-drag-hint { color: var(--txt-3); font-size: 14px; flex-shrink: 0; }

/* ── Canvas ── */
.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
}
.canvas {
  flex: 1;
  padding: 8px 12px 12px;
  min-height: 200px;
  transition: background 0.15s;
  overflow-y: auto;
}
.canvas-dragover {
  background: rgba(0, 229, 255, 0.03);
  outline: 2px dashed rgba(0,229,255,0.25);
  outline-offset: -8px;
  border-radius: var(--radius);
}
.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 20px;
  color: var(--txt-3);
}
.canvas-empty-icon { font-size: 36px; opacity: 0.3; }
.canvas-empty p { font-size: 13px; font-weight: 600; }
.canvas-empty-sub { font-size: 11px; font-family: 'JetBrains Mono', monospace; opacity: 0.6; }

/* ── Service Cards ── */
.service-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
  overflow: hidden;
}
.service-card:hover { border-color: var(--border-lit); }
.service-card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow), 0 4px 20px rgba(0,229,255,0.06);
}
.service-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}
.service-icon { font-size: 18px; flex-shrink: 0; }
.service-name-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: var(--txt-1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  padding: 2px 4px;
  transition: border-color 0.15s;
}
.service-name-input:focus { border-bottom-color: var(--accent); }
.card-remove {
  background: transparent;
  border: none;
  color: var(--txt-3);
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.card-remove:hover { color: var(--red); background: rgba(255,69,69,0.1); }

/* ── Card Body ── */
.service-card-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 2px;
  padding-top: 10px;
}
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--txt-2);
}
.field-hint { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--txt-3); }
.field-row { display: flex; gap: 4px; }
.field-group input, .field-row input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--txt-1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 5px 8px;
  outline: none;
  transition: border-color 0.15s;
}
.field-group input:focus, .field-row input:focus { border-color: var(--accent); }
.field-remove {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--txt-3);
  border-radius: 5px;
  padding: 0 6px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.15s;
}
.field-remove:hover { color: var(--red); border-color: var(--red); }
.field-add {
  background: transparent;
  border: 1px dashed var(--border-lit);
  color: var(--txt-3);
  border-radius: 5px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
  font-family: 'Syne', sans-serif;
  transition: all 0.15s;
  text-align: left;
}
.field-add:hover { color: var(--accent); border-color: var(--accent); }
.field-select, .field-select-sm {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--txt-1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 5px 8px;
  outline: none;
}
.field-select { min-height: 60px; }
.field-select-sm { height: 30px; }

/* ── YAML Panel ── */
.yaml-actions { display: flex; align-items: center; gap: 8px; }
.copied-badge {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--green);
  animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.yaml-pane {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg);
}
.yaml-output {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--txt-2);
  white-space: pre;
  tab-size: 2;
}

/* YAML syntax highlighting */
.y-key   { color: #79b8ff; }
.y-colon { color: var(--txt-3); }
.y-string { color: #9ecbff; }
.y-comment { color: var(--txt-3); font-style: italic; }
.y-bool  { color: var(--orange); }
.y-num   { color: #f8c555; }

.yaml-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--txt-3);
  flex-shrink: 0;
}
.yaml-version { color: var(--accent); margin-left: auto; }

/* ── Scrollbars ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-lit); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--txt-3); }
</style>