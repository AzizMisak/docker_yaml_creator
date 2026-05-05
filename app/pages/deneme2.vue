<template>
  <div class="min-h-screen flex flex-col overflow-hidden bg-[#0d0f14] text-[#e8ecf5] font-['Syne',sans-serif]">
    <!-- Top Bar -->
    <header class="flex items-center justify-between px-6 h-[52px] border-b border-[#252a38] bg-[#12151d] shrink-0 z-10">
      <div class="flex items-center gap-2.5">
        <span class="text-[22px] text-[#00e5ff] leading-none">⬡</span>
        <span class="text-[17px] font-extrabold tracking-[-0.5px] text-[#e8ecf5]">DockerForge</span>
        <span class="font-['JetBrains_Mono',monospace] text-[10px] font-medium py-0.5 px-2 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-[#00e5ff] tracking-widest uppercase">YAML Builder</span>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10" @click="clearAll">
          <span>✕</span> Clear
        </button>
        <button class="flex items-center gap-1.5 bg-[#00e5ff] border-none text-black py-1.5 px-4 rounded-lg text-[13px] font-bold cursor-pointer transition-all duration-150 hover:bg-[#00b8cc]" @click="downloadYaml">
          <span>↓</span> Download YAML
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden h-[calc(100vh-52px)]">
      <!-- LEFT PANEL -->
      <div class="flex flex-col overflow-hidden w-1/2 border-r border-[#252a38] bg-[#12151d] overflow-y-auto">
        <div class="flex items-center justify-between p-3 px-5 border-b border-[#252a38] shrink-0">
          <span class="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">Services</span>
          <span class="text-[11px] text-[#525c75] font-['JetBrains_Mono',monospace]">Drag to canvas</span>
        </div>

        <!-- Service Palette -->
        <div class="p-3 grid grid-cols-2 gap-1.5 border-b border-[#252a38]">
          <div
              v-for="preset in presets"
              :key="preset.id"
              class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-[#252a38] bg-[#181c27] cursor-grab transition-all duration-150 select-none hover:border-[#00e5ff] hover:bg-[#1e2333] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.12)] active:cursor-grabbing"
              draggable="true"
              @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="text-[18px] shrink-0">{{ preset.icon }}</span>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[12px] font-bold text-[#e8ecf5]">{{ preset.label }}</span>
              <span class="text-[10px] text-[#525c75] font-['JetBrains_Mono',monospace] whitespace-nowrap overflow-hidden text-ellipsis">{{ preset.image }}</span>
            </div>
            <span class="text-[#525c75] text-[14px] shrink-0">⠿</span>
          </div>
        </div>

        <!-- Canvas Drop Zone -->
        <div class="flex items-center justify-between pt-3 px-5 pb-2">
          <span class="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">Canvas</span>
          <span class="font-['JetBrains_Mono',monospace] text-[11px] text-[#00e5ff]">{{ services.length }} service{{ services.length !== 1 ? 's' : '' }}</span>
        </div>
        <div
            class="flex-1 py-2 px-3 min-h-[200px] transition-colors duration-150 overflow-y-auto"
            :class="{ 'bg-[#00e5ff]/5 outline-dashed outline-2 outline-[#00e5ff]/25 -outline-offset-8 rounded-lg': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="onCanvasDrop($event)"
        >
          <div v-if="services.length === 0" class="flex flex-col items-center justify-center gap-2 py-12 px-5 text-[#525c75]">
            <span class="text-[36px] opacity-30">⬡</span>
            <p class="text-[13px] font-semibold">Drop services here</p>
            <p class="text-[11px] font-['JetBrains_Mono',monospace] opacity-60">Build your docker-compose stack</p>
          </div>

          <div
              v-for="(service, index) in services"
              :key="service._uid"
              class="border rounded-xl mb-1.5 cursor-pointer transition-all duration-150 overflow-hidden bg-[#181c27] hover:border-[#2e3549]"
              :class="activeService === service._uid ? 'border-[#00e5ff] shadow-[0_0_0_1px_rgba(0,229,255,0.12),0_4px_20px_rgba(0,229,255,0.06)]' : 'border-[#252a38]'"
              draggable="true"
              @dragstart="onCardDragStart($event, index)"
              @dragover.prevent="onCardDragOver($event, index)"
              @drop.prevent="onCardDrop($event, index)"
              @click="toggleService(service._uid)"
          >
            <div class="flex items-center gap-2.5 py-2.5 px-3">
              <span class="text-[18px] shrink-0">{{ service.icon }}</span>
              <input
                  v-model="service.name"
                  class="flex-1 bg-transparent border-none border-b border-transparent text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[13px] font-medium outline-none py-0.5 px-1 transition-colors duration-150 focus:border-[#00e5ff]"
                  placeholder="service-name"
                  @click.stop
                  @input="generateYaml"
              />
              <button class="bg-transparent border-none text-[#525c75] cursor-pointer text-[12px] p-1 rounded transition-all duration-150 shrink-0 hover:text-[#ff4545] hover:bg-[#ff4545]/10" @click.stop="removeService(index)">✕</button>
            </div>

            <!-- Expanded Config -->
            <div v-if="activeService === service._uid" class="px-3 pb-3 border-t border-[#252a38] flex flex-col gap-2.5 mt-0.5 pt-2.5">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Image</label>
                <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none transition-colors duration-150 focus:border-[#00e5ff]" v-model="service.image" placeholder="nginx:latest" @input="generateYaml" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Ports <span class="font-normal normal-case tracking-normal text-[#525c75]">(host:container)</span></label>
                <div v-for="(port, pi) in service.ports" :key="pi" class="flex gap-1">
                  <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none transition-colors duration-150 focus:border-[#00e5ff]" v-model="service.ports[pi]" placeholder="8080:80" @input="generateYaml" />
                  <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-1.5 cursor-pointer text-[10px] transition-all duration-150 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.ports.splice(pi, 1); generateYaml()">✕</button>
                </div>
                <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1 px-2 cursor-pointer text-[11px] font-['Syne',sans-serif] transition-all duration-150 text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.ports.push(''); generateYaml()">+ Add Port</button>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Environment <span class="font-normal normal-case tracking-normal text-[#525c75]">(KEY=VALUE)</span></label>
                <div v-for="(env, ei) in service.environment" :key="ei" class="flex gap-1">
                  <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none transition-colors duration-150 focus:border-[#00e5ff]" v-model="service.environment[ei]" placeholder="NODE_ENV=production" @input="generateYaml" />
                  <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-1.5 cursor-pointer text-[10px] transition-all duration-150 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.environment.splice(ei, 1); generateYaml()">✕</button>
                </div>
                <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1 px-2 cursor-pointer text-[11px] font-['Syne',sans-serif] transition-all duration-150 text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.environment.push(''); generateYaml()">+ Add Env</button>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Volumes <span class="font-normal normal-case tracking-normal text-[#525c75]">(host:container)</span></label>
                <div v-for="(vol, vi) in service.volumes" :key="vi" class="flex gap-1">
                  <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none transition-colors duration-150 focus:border-[#00e5ff]" v-model="service.volumes[vi]" placeholder="./data:/var/data" @input="generateYaml" />
                  <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-1.5 cursor-pointer text-[10px] transition-all duration-150 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.volumes.splice(vi, 1); generateYaml()">✕</button>
                </div>
                <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1 px-2 cursor-pointer text-[11px] font-['Syne',sans-serif] transition-all duration-150 text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.volumes.push(''); generateYaml()">+ Add Volume</button>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Depends On</label>
                <select v-model="service.depends_on" multiple @change="generateYaml" class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none min-h-[60px]">
                  <option v-for="s in services.filter(s => s._uid !== service._uid)" :key="s._uid" :value="s.name">
                    {{ s.name || '(unnamed)' }}
                  </option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Restart Policy</label>
                <select v-model="service.restart" @change="generateYaml" class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none h-[30px]">
                  <option value="">none</option>
                  <option value="always">always</option>
                  <option value="unless-stopped">unless-stopped</option>
                  <option value="on-failure">on-failure</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Networks</label>
                <div v-for="(net, ni) in service.networks" :key="ni" class="flex gap-1">
                  <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none transition-colors duration-150 focus:border-[#00e5ff]" v-model="service.networks[ni]" placeholder="app-network" @input="generateYaml" />
                  <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-1.5 cursor-pointer text-[10px] transition-all duration-150 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.networks.splice(ni, 1); generateYaml()">✕</button>
                </div>
                <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1 px-2 cursor-pointer text-[11px] font-['Syne',sans-serif] transition-all duration-150 text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.networks.push(''); generateYaml()">+ Add Network</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="relative w-0">
        <div class="absolute top-0 -left-[1px] w-[2px] h-full bg-[linear-gradient(180deg,transparent,#00e5ff_30%,#00e5ff_70%,transparent)] opacity-20"></div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="flex flex-col overflow-hidden w-1/2 bg-[#0d0f14]">
        <div class="flex items-center justify-between p-3 px-5 border-b border-[#252a38] shrink-0">
          <span class="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">docker-compose.yml</span>
          <div class="flex items-center gap-2">
            <span v-if="copied" class="text-[11px] font-['JetBrains_Mono',monospace] text-[#39ff8e] animate-[fadeIn_0.2s]">Copied!</span>
            <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10" @click="copyYaml">
              <span>⎘</span> Copy
            </button>
            <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10" @click="downloadYaml">
              <span>↓</span> Download
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 bg-[#0d0f14]">
          <pre class="font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#8891aa] whitespace-pre tab-[2]"><code v-html="highlightedYaml"></code></pre>
        </div>

        <!-- Stats bar -->
        <div class="flex items-center gap-2 py-2 px-5 border-t border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#525c75] shrink-0">
          <span>{{ services.length }} services</span>
          <span>•</span>
          <span>{{ uniqueNetworks.length }} network{{ uniqueNetworks.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span>{{ uniqueVolumes.length }} volume{{ uniqueVolumes.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span class="text-[#00e5ff] ml-auto">version: "3.8"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ─── Presets ──────────────────────────────────────────────────────────────────
const presets = [
  { id: 'nginx',    label: 'Nginx',      image: 'nginx:alpine',         icon: '🌐', defaultPorts: ['80:80'], defaultEnv: [] },
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
      .replace(/^(#.*)$/gm, "<span class='y-comment'>$1</span>")
      .replace(/^(\s*)([\w-]+)(:)/gm, "$1<span class='y-key'>$2</span><span class='y-colon'>$3</span>")
      .replace(/"([^"]*)"/g, "<span class='y-string'>\"$1\"</span>")
      .replace(/\b(true|false|null)\b/g, "<span class='y-bool'>$1</span>")
      .replace(/(\b\d+\b)/g, "<span class='y-num'>$1</span>")
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap');

/* YAML syntax highlighting classes injected via v-html */
:deep(.y-key)   { color: #79b8ff; }
:deep(.y-colon) { color: #525c75; }
:deep(.y-string) { color: #9ecbff; }
:deep(.y-comment) { color: #525c75; font-style: italic; }
:deep(.y-bool)  { color: #ff9520; }
:deep(.y-num)   { color: #f8c555; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Custom Scrollbars (Tailwind natively doesn't handle scrollbars easily without plugins) ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2e3549; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #525c75; }
</style>