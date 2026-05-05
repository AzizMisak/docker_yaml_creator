<template>
  <div class="min-h-screen flex flex-col overflow-hidden bg-[#0d0f14] text-[#e8ecf5] font-['Syne',sans-serif]">
    <!-- Top Bar -->
    <header class="flex items-center justify-between px-6 h-[52px] border-b border-[#252a38] bg-[#12151d] shrink-0 z-10">
      <div class="flex items-center gap-2.5">
        <span class="text-[22px] text-[#00e5ff] leading-none">⬡</span>
        <span class="text-[17px] font-extrabold tracking-[-0.5px] text-[#e8ecf5]">DockerForge</span>
        <span class="font-['JetBrains_Mono',monospace] text-[10px] font-medium py-0.5 px-2 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-[#00e5ff] tracking-widest uppercase">Unified Workspace</span>
      </div>

      <div class="flex gap-2">
        <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10" @click="clearAll">
          <span>✕</span> Clear
        </button>
        <button class="flex items-center gap-1.5 bg-[#00e5ff] border-none text-black py-1.5 px-4 rounded-lg text-[13px] font-bold cursor-pointer transition-all duration-150 hover:bg-[#00b8cc]" @click="downloadYaml">
          <span>↓</span> Download All
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden h-[calc(100vh-52px)]">
      <!-- TOOLBOX (Left Panel) -->
      <div class="flex flex-col overflow-hidden w-[280px] border-r border-[#252a38] bg-[#12151d] shrink-0 overflow-y-auto relative">
        <div class="flex items-center justify-between p-3 px-5 border-b border-[#252a38] shrink-0">
          <span class="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">Toolbox</span>
          <span class="text-[11px] text-[#525c75] font-['JetBrains_Mono',monospace]">Drag items</span>
        </div>

        <!-- Infrastructure Palette -->
        <div class="p-3 grid grid-cols-1 gap-2 border-b border-[#252a38] bg-[#0d0f14]">
          <div
              v-for="preset in k8sInfraPresets"
              :key="preset.id"
              class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-[#252a38] bg-[#181c27] cursor-grab transition-all duration-150 select-none hover:border-[#39ff8e] hover:bg-[#1e2333] hover:shadow-[0_0_0_1px_rgba(57,255,142,0.12)] active:cursor-grabbing"
              draggable="true"
              @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="text-[18px] shrink-0">{{ preset.icon }}</span>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[12px] font-bold text-[#e8ecf5]">{{ preset.label }}</span>
              <span class="text-[10px] text-[#525c75] font-['JetBrains_Mono',monospace] whitespace-nowrap overflow-hidden text-ellipsis">infra element</span>
            </div>
            <span class="text-[#525c75] text-[14px] shrink-0">⠿</span>
          </div>
        </div>

        <!-- Apps/Images Palette -->
        <div class="p-3 grid grid-cols-1 gap-2 border-b border-[#252a38]">
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
      </div>

      <!-- CANVAS (Middle Panel) -->
      <div class="flex flex-col flex-1 overflow-y-auto bg-[#0a0c10] relative"
           @dragover.prevent="isDragOver = true"
           @dragleave="isDragOver = false"
           @drop.prevent="onCanvasDrop($event)">

        <div class="absolute inset-0 pointer-events-none transition-all"
             :class="{ 'bg-[#00e5ff]/5 outline-dashed outline-2 outline-[#00e5ff]/25 -outline-offset-8': isDragOver }"></div>

        <div class="flex items-center justify-between pt-4 px-6 pb-2 relative z-10 shrink-0">
          <span class="text-[12px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">Free Playground Canvas</span>
          <span class="font-['JetBrains_Mono',monospace] text-[11px] text-[#525c75]">
             Drop images for Docker, or Clusters for K8s
          </span>
        </div>

        <!-- Canvas Playground Content -->
        <div class="flex-1 p-6 relative z-10 flex flex-col gap-6">

          <!-- K8s Clusters -->
          <div v-for="(cluster, cIndex) in k8sClusters" :key="cluster.id" class="border-2 border-[#39ff8e]/30 rounded-xl bg-[#12151d] p-5 shadow-[0_8px_30px_rgba(57,255,142,0.05)]">
            <div class="flex items-center justify-between mb-4 border-b border-[#252a38] pb-3">
              <div class="flex items-center gap-3">
                <span class="text-[24px]">⎈</span>
                <input v-model="cluster.name" class="bg-transparent border-none text-[#39ff8e] font-bold text-[18px] outline-none" @input="generateK8sYaml" />
                <span class="text-[10px] uppercase tracking-widest text-[#39ff8e]/50 px-2 py-0.5 border border-[#39ff8e]/20 rounded-full">K8S Cluster</span>
              </div>
              <button class="text-[#ff4545] hover:bg-[#ff4545]/10 px-3 py-1.5 rounded transition-colors text-[12px] font-bold" @click="k8sClusters.splice(cIndex, 1); generateK8sYaml()">✕ Remove</button>
            </div>

            <!-- Nodes Drop Zone -->
            <div
                class="min-h-[120px] border-2 border-dashed border-[#252a38] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-colors"
                @dragover.prevent="onItemDragOver"
                @drop.prevent="onNodeDrop(cluster, $event)"
            >
              <div v-if="cluster.nodes.length === 0" class="col-span-full text-[#525c75] text-[12px] flex items-center justify-center min-h-[80px] bg-[#0d0f14]/50 rounded-lg">Drop Worker Nodes Here</div>

              <!-- Nodes -->
              <div v-for="(node, nIndex) in cluster.nodes" :key="node.id" class="border border-[#79b8ff]/40 rounded-xl bg-[#181c27] p-4 flex flex-col">
                <div class="flex items-center justify-between mb-3 border-b border-[#252a38]/50 pb-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-[18px] shrink-0">🖥️</span>
                    <input v-model="node.name" class="bg-transparent border-none text-[#79b8ff] font-semibold text-[14px] outline-none flex-1 min-w-0 text-ellipsis" @input="generateK8sYaml" />
                  </div>
                  <button class="text-[#ff4545] text-[14px] hover:bg-[#ff4545]/10 px-2 py-0.5 rounded shrink-0 ml-2" @click="cluster.nodes.splice(nIndex, 1); generateK8sYaml()">✕</button>
                </div>

                <!-- Pods Drop Zone -->
                <div
                    class="flex-1 min-h-[90px] bg-[#0d0f14] border border-[#252a38]/80 rounded-lg p-2.5 flex flex-col gap-2"
                    @dragover.prevent="onItemDragOver"
                    @drop.prevent="onPodDrop(node, $event)"
                >
                  <div v-if="node.pods.length === 0" class="text-[#525c75] text-[10px] text-center my-auto py-2">Drop an Image/App for Pod</div>

                  <!-- Pods -->
                  <div v-for="(pod, pIndex) in node.pods" :key="pod.id" class="border border-[#f8c555]/30 bg-[#1e2333] rounded px-2.5 py-2 flex items-start gap-2">
                    <span class="text-[16px] mt-0.5 shrink-0">📦</span>
                    <div class="flex flex-col flex-1 min-w-0">
                      <input v-model="pod.name" class="bg-transparent border-none text-[#f8c555] font-bold text-[12px] font-['JetBrains_Mono',monospace] outline-none w-full text-ellipsis overflow-hidden" @input="generateK8sYaml"/>
                      <input v-model="pod.image" class="bg-transparent border-none text-[#8891aa] text-[10px] font-['JetBrains_Mono',monospace] outline-none w-full text-ellipsis overflow-hidden" placeholder="image:latest" @input="generateK8sYaml"/>
                    </div>
                    <button class="text-[#ff4545] text-[14px] hover:bg-[#ff4545]/10 px-1.5 py-0.5 rounded shrink-0 ml-1 transition-colors" @click="node.pods.splice(pIndex, 1); generateK8sYaml()">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider if both exist -->
          <div v-if="k8sClusters.length > 0 && services.length > 0" class="h-px bg-[#252a38] w-full my-2"></div>

          <!-- Docker Standalone Services Array -->
          <div v-if="services.length > 0" class="flex flex-col gap-3">
            <div class="flex items-center gap-2 px-1">
              <span class="text-[14px]">🐳</span>
              <span class="text-[13px] font-bold text-[#e8ecf5]">Standalone Docker Services</span>
            </div>

            <!-- Render Docker services grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
              <div
                  v-for="(service, index) in services"
                  :key="service._uid"
                  class="border rounded-xl transition-all duration-150 overflow-hidden bg-[#181c27] hover:border-[#2e3549] flex flex-col"
                  :class="activeService === service._uid ? 'border-[#00e5ff] shadow-[0_0_0_1px_rgba(0,229,255,0.12),0_4px_20px_rgba(0,229,255,0.06)]' : 'border-[#252a38]'"
                  draggable="true"
                  @dragstart="onCardDragStart($event, index)"
                  @dragover.prevent="onCardDragOver($event, index)"
                  @drop.prevent="onCardDrop($event, index)"
              >
                <div class="flex items-center gap-2.5 py-3 px-4 bg-[#12151d] border-b border-[#252a38] cursor-pointer" @click="toggleService(service._uid)">
                  <span class="text-[20px] shrink-0 cursor-grab active:cursor-grabbing" @click.stop>{{ service.icon }}</span>
                  <input
                      v-model="service.name"
                      class="flex-1 min-w-0 bg-transparent border-none border-b border-transparent text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[14px] font-bold outline-none py-0.5 px-1 transition-colors duration-150 focus:border-[#00e5ff] text-ellipsis overflow-hidden"
                      placeholder="service-name"
                      @click.stop
                      @input="generateYaml"
                  />
                  <button class="bg-[#01e5ff]/4 border-none text-[#525c75] cursor-pointer text-[12px] p-1.5 rounded transition-all duration-150 shrink-0 ml-1 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10" @click.stop="toggleService(service._uid)" >
                    {{ activeService === service._uid ? '▲' : '▼' }}
                  </button>
                  <button class="bg-transparent border-none text-[#525c75] cursor-pointer text-[14px] p-1.5 rounded transition-all duration-150 shrink-0 hover:text-[#ff4545] hover:bg-[#ff4545]/10" @click.stop="removeService(index)">✕</button>
                </div>

                <!-- Expanded Config -->
                <div v-if="activeService === service._uid" class="px-4 pb-4 pt-3 flex flex-col gap-3 cursor-default" @click.stop>
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Image</label>
                    <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2.5 outline-none focus:border-[#00e5ff]" v-model="service.image" placeholder="nginx:latest" @input="generateYaml" />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Ports <span class="font-normal normal-case tracking-normal text-[#525c75]">(host:container)</span></label>
                    <div v-for="(port, pi) in service.ports" :key="pi" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.ports[pi]" placeholder="8080:80" @input="generateYaml" />
                      <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-2 cursor-pointer text-[12px] hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.ports.splice(pi, 1); generateYaml()">✕</button>
                    </div>
                    <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 cursor-pointer text-[11px] font-bold mt-1 text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.ports.push(''); generateYaml()">+ Add Port</button>
                  </div>

                  <!-- Environment -->
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Environment <span class="font-normal normal-case tracking-normal text-[#525c75]">(KEY=VALUE)</span></label>
                    <div v-for="(env, ei) in service.environment" :key="ei" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.environment[ei]" placeholder="NODE_ENV=production" @input="generateYaml" />
                      <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.environment.splice(ei, 1); generateYaml()">✕</button>
                    </div>
                    <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 cursor-pointer text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.environment.push(''); generateYaml()">+ Add Env</button>
                  </div>

                  <!-- Depends On -->
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Depends On</label>
                    <div v-for="(dep, di) in service.depends_on" :key="di" class="flex gap-1.5">
                      <select class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.depends_on[di]" @change="generateYaml">
                        <option disabled value="">Select service...</option>
                        <option v-for="other in services.filter(s => s._uid !== service._uid)" :key="other._uid" :value="other.name">{{ other.name }}</option>
                      </select>
                      <button class="bg-transparent border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.depends_on.splice(di, 1); generateYaml()">✕</button>
                    </div>
                    <button class="bg-transparent border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 cursor-pointer text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.depends_on.push(''); generateYaml()">+ Add Dependency</button>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mt-1">
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Restart</label>
                      <select v-model="service.restart" @change="generateYaml" class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2 outline-none">
                        <option value="">none</option>
                        <option value="always">always</option>
                        <option value="unless-stopped">unless-stopped</option>
                        <option value="on-failure">on-failure</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="k8sClusters.length === 0 && services.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center opacity-20">
              <span class="text-[80px]">⬡</span>
              <p class="text-[20px] font-bold tracking-widest mt-4">FREESTYLE CANVAS</p>
              <p class="text-[14px]">Drag standalone Services or K8s Clusters here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL (CODE OUTPUT) -->
      <div class="flex flex-col overflow-hidden w-[450px] bg-[#0d0f14] border-l border-[#252a38] shrink-0">
        <div class="flex items-center justify-between p-3 px-5 border-b border-[#252a38] shrink-0">
          <div class="flex gap-2">
            <button class="px-3 py-1 font-bold text-[11px] uppercase tracking-[1px] rounded" :class="outputTab === 'docker' ? 'bg-[#00e5ff] text-black' : 'text-[#8891aa] hover:bg-[#252a38]'" @click="outputTab = 'docker'">docker-compose.yml</button>
            <button class="px-3 py-1 font-bold text-[11px] uppercase tracking-[1px] rounded" :class="outputTab === 'k8s' ? 'bg-[#39ff8e] text-black' : 'text-[#8891aa] hover:bg-[#252a38]'" @click="outputTab = 'k8s'">k8s-manifest.yaml</button>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="copiedAll" class="text-[11px] font-['JetBrains_Mono',monospace] text-[#39ff8e] animate-[fadeIn_0.2s]">Copied All!</span>
            <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10" @click="copyYaml">
              <span>⎘</span> Copy All
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 bg-[#0d0f14]">
          <!-- Docker Tab -->
          <pre v-if="outputTab === 'docker'" class="font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#8891aa] whitespace-pre tab-[2]"><code v-html="highlightedYaml"></code></pre>

          <!-- K8s Tab (File by File) -->
          <div v-else-if="outputTab === 'k8s'">
            <pre v-if="k8sFiles.length === 0" class="font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#525c75] italic whitespace-pre"><code v-html="highlightedK8sYaml"></code></pre>
            <div v-for="(file, index) in highlightedK8sFiles" :key="index" class="mb-5 border border-[#252a38] rounded-lg bg-[#12151d] overflow-hidden">
              <div class="flex items-center justify-between px-3 py-2 bg-[#181c27] border-b border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#8891aa]">
                <div class="flex items-center gap-2">
                  <span class="text-[14px]">📄</span> {{ file.name }}
                </div>
                <div class="flex items-center gap-3">
                  <span v-if="copiedFileIndex === index" class="text-[10px] text-[#39ff8e] animate-[fadeIn_0.2s]">Copied!</span>
                  <button class="bg-transparent border-none text-[#525c75] hover:text-[#39ff8e] cursor-pointer transition-colors p-0 flex items-center justify-center text-[13px]" @click="copySingleFile(file, index)" title="Copy File">⎘</button>
                  <button class="bg-transparent border-none text-[#525c75] hover:text-[#00e5ff] cursor-pointer transition-colors p-0 flex items-center justify-center text-[13px]" @click="downloadSingleFile(file)" title="Download File">↓</button>
                </div>
              </div>
              <pre class="p-4 m-0 font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#8891aa] whitespace-pre overflow-x-auto"><code v-html="file.html"></code></pre>
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="flex items-center gap-2 py-2 px-5 border-t border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#525c75] shrink-0" v-show="outputTab === 'docker'">
          <span>{{ services.length }} services</span>
          <span>•</span>
          <span>{{ uniqueNetworks.length }} network{{ uniqueNetworks.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span>{{ uniqueVolumes.length }} volume{{ uniqueVolumes.length !== 1 ? 's' : '' }}</span>
          <span>•</span>
          <span class="text-[#00e5ff] ml-auto">version: "3.8"</span>
        </div>
        <div class="flex items-center gap-2 py-2 px-5 border-t border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#525c75] shrink-0" v-show="outputTab === 'k8s'">
          <span>{{ k8sClusters.length }} clusters</span>
          <span>•</span>
          <span>{{ k8sTotalNodes }} nodes</span>
          <span>•</span>
          <span>{{ k8sTotalPods }} pods</span>
          <span class="text-[#39ff8e] ml-auto">API: v1</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const outputTab = ref('docker') // 'docker' | 'k8s'

// ─── K8s Presets ──────────────────────────────────────────────────────────────
const k8sInfraPresets = [
  { id: 'cluster', label: 'Cluster', type: 'cluster', icon: '⎈' },
  { id: 'node', label: 'Worker Node', type: 'node', icon: '🖥️' },
]

// ─── K8s State ────────────────────────────────────────────────────────────────
const k8sClusters = ref([])
const isK8sDragOver = ref(false)
const k8sFiles = ref([]) // Holds K8s files separately
const copiedFileIndex = ref(null) // Tracks which file was individually copied
let k8sUidCounter = 0

// Universal Drag Info
let dragItem = null
let dragSource = null

const k8sTotalNodes = computed(() => k8sClusters.value.reduce((acc, c) => acc + c.nodes.length, 0))
const k8sTotalPods = computed(() => k8sClusters.value.reduce((acc, c) => acc + c.nodes.reduce((acc2, n) => acc2 + n.pods.length, 0), 0))
const k8sOutput = ref('')

function getNextK8sName(items, prefix) {
  let i = 1;
  while (items.some(item => item.name === `${prefix}-${i}`)) {
    i++;
  }
  return `${prefix}-${i}`;
}

function onPaletteDragStart(event, preset) {
  dragSource = 'palette'
  dragItem = preset
  event.dataTransfer.effectAllowed = 'copy'
}

function onItemDragOver(event) {
  // nested drop zones allow drop
  event.dataTransfer.dropEffect = 'copy'
}

function onCanvasDrop(event) {
  isDragOver.value = false
  if (dragSource === 'palette' && dragItem) {
    if (dragItem.type === 'cluster') {
      k8sClusters.value.push({
        id: ++k8sUidCounter,
        name: getNextK8sName(k8sClusters.value, 'cluster'),
        nodes: []
      })
      generateK8sYaml()
    } else {
      addService(dragItem) // Standalone Docker Service if not a cluster
    }
  }
  dragSource = null
  dragItem = null
}

function onNodeDrop(cluster, event) {
  if (dragItem) {
    if (dragItem.type === 'node') {
      cluster.nodes.push({
        id: ++k8sUidCounter,
        name: getNextK8sName(cluster.nodes, 'node'),
        pods: []
      })
    } else {
      // If an image app is dropped into Node, make it a pod!
      const targetNode = cluster.nodes[cluster.nodes.length - 1 < 0 ? 0 : cluster.nodes.length - 1];
      if (targetNode) {
        const podPrefix = `pod-${dragItem.id || 'custom'}`;
        targetNode.pods.push({
          id: ++k8sUidCounter,
          name: getNextK8sName(targetNode.pods, podPrefix),
          image: dragItem.image || 'ubuntu:latest'
        })
      }
    }
    generateK8sYaml()
  }
  event.stopPropagation()
}

function onPodDrop(node, event) {
  if (dragItem && (dragItem.image || !dragItem.type || dragItem.type === 'service')) {
    const podPrefix = `pod-${dragItem.id || 'custom'}`;
    node.pods.push({
      id: ++k8sUidCounter,
      name: getNextK8sName(node.pods, podPrefix),
      image: dragItem.image || 'ubuntu:latest'
    })
    generateK8sYaml()
  }
  event.stopPropagation()
}

function generateK8sYaml() {
  if (k8sClusters.value.length === 0) {
    k8sOutput.value = '# Build your K8s topology\n# Drop Clusters, then add Nodes and Pods'
    k8sFiles.value = []
    return
  }

  const files = []

  k8sClusters.value.forEach(cluster => {
    // Generate namespace file
    files.push({
      name: `namespace-${cluster.name}.yaml`,
      content: `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: ${cluster.name}`
    })

    cluster.nodes.forEach(node => {
      node.pods.forEach(pod => {
        // Generate pod files
        files.push({
          name: `pod-${pod.name}.yaml`,
          content: `apiVersion: v1\nkind: Pod\nmetadata:\n  name: ${pod.name}\n  namespace: ${cluster.name}\n  labels:\n    node: ${node.name}\nspec:\n  nodeName: ${node.name} # Simulated scheduling\n  containers:\n    - name: main\n      image: ${pod.image}`
        })
      })
    })
  })

  k8sFiles.value = files
  k8sOutput.value = files.map(f => f.content).join('\n---\n') // Keep combined version for Copy/Download All
}

const highlightedK8sYaml = computed(() => {
  return k8sOutput.value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^(#.*)$/gm, "<span class='y-comment'>$1</span>")
      .replace(/^(\s*)([\w-]+)(:)(?=\s|$)/gm, "$1<span class='y-key'>$2</span><span class='y-colon'>$3</span>")
      .replace(/"([^"]*)"/g, "<span class='y-string'>\"$1\"</span>")
      .replace(/\b(true|false|null)\b/g, "<span class='y-bool'>$1</span>")
      .replace(/(\b\d+\b)/g, "<span class='y-num'>$1</span>")
})

const highlightedK8sFiles = computed(() => {
  return k8sFiles.value.map(file => {
    return {
      name: file.name,
      content: file.content,
      html: file.content
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/^(#.*)$/gm, "<span class='y-comment'>$1</span>")
          .replace(/^(\s*)([\w-]+)(:)(?=\s|$)/gm, "$1<span class='y-key'>$2</span><span class='y-colon'>$3</span>")
          .replace(/"([^"]*)"/g, "<span class='y-string'>\"$1\"</span>")
          .replace(/\b(true|false|null)\b/g, "<span class='y-bool'>$1</span>")
          .replace(/(\b\d+\b)/g, "<span class='y-num'>$1</span>")
    }
  })
})


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
const copiedAll      = ref(false)
let   dragCardIndex  = null
let   uidCounter     = 0

// ─── Drag from Palette ────────────────────────────────────────────────────────
// Logic already merged into onPaletteDragStart above

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

function getNextServiceName(servicesList, baseId) {
  if (!servicesList.some(s => s.name === baseId)) return baseId;
  let i = 2;
  while (servicesList.some(s => s.name === `${baseId}-${i}`)) {
    i++;
  }
  return `${baseId}-${i}`;
}

function addService(preset) {
  const name = getNextServiceName(services.value, preset.id);
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
  services.value = []
  activeService.value = null
  k8sClusters.value = []
  generateYaml()
  generateK8sYaml()
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

// ─── Clipboard / Download (Global) ────────────────────────────────────────────
function copyYaml() {
  const content = outputTab.value === 'docker' ? yamlOutput.value : k8sOutput.value;
  navigator.clipboard.writeText(content).then(() => {
    copiedAll.value = true
    setTimeout(() => (copiedAll.value = false), 2000)
  })
}

function downloadYaml() {
  const content = outputTab.value === 'docker' ? yamlOutput.value : k8sOutput.value;
  const fileName = outputTab.value === 'docker' ? 'docker-compose.yml' : 'k8s-manifest.yaml';

  const blob = new Blob([content], { type: 'text/yaml' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Clipboard / Download (Single K8s File) ───────────────────────────────────
function copySingleFile(file, index) {
  navigator.clipboard.writeText(file.content).then(() => {
    copiedFileIndex.value = index;
    setTimeout(() => { copiedFileIndex.value = null }, 2000);
  });
}

function downloadSingleFile(file) {
  const blob = new Blob([file.content], { type: 'text/yaml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  generateYaml()
  generateK8sYaml()
})
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