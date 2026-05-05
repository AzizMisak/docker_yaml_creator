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
        <button class="flex items-center gap-1.5 bg-transparent border border-[#2e3549] text-[#8891aa] py-1.5 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:text-[#e8ecf5] hover:border-[#ff4545] hover:bg-[#ff4545]/10" @click="clearAll">
          <span>✕</span> Clear
        </button>
        <button class="flex items-center gap-1.5 bg-[#00e5ff] border-none text-black py-1.5 px-4 rounded-lg text-[13px] font-bold cursor-pointer transition-all duration-150 hover:bg-[#00b8cc]" @click="downloadYaml">
          <span>↓</span> Download
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden h-[calc(100vh-52px)]">

      <!-- ══════════════════════════════════════════════════════════════════════
           TOOLBOX — Left Panel
      ══════════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col w-[260px] border-r border-[#252a38] bg-[#12151d] shrink-0 overflow-y-auto">

        <div class="px-4 pt-3 pb-1 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-[1.5px] text-[#39ff8e]">K8s Infrastructure</span>
        </div>
        <div class="px-3 pb-3 grid grid-cols-1 gap-1.5 border-b border-[#252a38]">
          <div
              v-for="preset in k8sInfraPresets" :key="preset.id"
              class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-[#252a38] bg-[#181c27] cursor-grab transition-all duration-150 select-none hover:border-[#39ff8e] hover:bg-[#1e2333] active:cursor-grabbing"
              draggable="true" @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="text-[18px] shrink-0">{{ preset.icon }}</span>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[12px] font-bold text-[#e8ecf5]">{{ preset.label }}</span>
              <span class="text-[10px] text-[#525c75] font-['JetBrains_Mono',monospace]">infra element</span>
            </div>
            <span class="text-[#525c75] text-sm shrink-0">⠿</span>
          </div>
        </div>

        <div class="px-4 pt-3 pb-1 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-[1.5px] text-[#39ff8e]">K8s Workloads</span>
        </div>
        <div class="px-3 pb-3 grid grid-cols-1 gap-1.5 border-b border-[#252a38]">
          <div
              v-for="preset in k8sWorkloadPresets" :key="preset.id"
              class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-[#252a38] bg-[#181c27] cursor-grab transition-all duration-150 select-none hover:border-[#39ff8e] hover:bg-[#1e2333] active:cursor-grabbing"
              draggable="true" @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="text-[18px] shrink-0">{{ preset.icon }}</span>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[12px] font-bold text-[#e8ecf5]">{{ preset.label }}</span>
              <span class="text-[10px] text-[#525c75] font-['JetBrains_Mono',monospace]">k8s resource</span>
            </div>
            <span class="text-[#525c75] text-sm shrink-0">⠿</span>
          </div>
        </div>

        <div class="px-4 pt-3 pb-1 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-[1.5px] text-[#00e5ff]">Docker Images</span>
        </div>
        <div class="px-3 pb-4 grid grid-cols-1 gap-1.5">
          <div
              v-for="preset in presets" :key="preset.id"
              class="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-[#252a38] bg-[#181c27] cursor-grab transition-all duration-150 select-none hover:border-[#00e5ff] hover:bg-[#1e2333] active:cursor-grabbing"
              draggable="true" @dragstart="onPaletteDragStart($event, preset)"
          >
            <span class="text-[18px] shrink-0">{{ preset.icon }}</span>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[12px] font-bold text-[#e8ecf5]">{{ preset.label }}</span>
              <span class="text-[10px] text-[#525c75] font-['JetBrains_Mono',monospace] truncate">{{ preset.image }}</span>
            </div>
            <span class="text-[#525c75] text-sm shrink-0">⠿</span>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════════
           CANVAS — Middle Panel
      ══════════════════════════════════════════════════════════════════════ -->
      <div
          class="flex flex-col flex-1 overflow-y-auto bg-[#0a0c10] relative"
          @dragover.prevent="isDragOver = true"
          @dragleave.self="isDragOver = false"
          @drop.prevent="onCanvasDrop($event)"
      >
        <div class="absolute inset-0 pointer-events-none transition-all duration-150 rounded-xl"
             :class="isDragOver ? 'bg-[#00e5ff]/[0.03] outline-dashed outline-2 outline-[#00e5ff]/25 outline-offset-[-8px]' : ''"></div>

        <div class="flex items-center justify-between pt-4 px-6 pb-2 shrink-0 relative z-10">
          <span class="text-[12px] font-bold uppercase tracking-[1.5px] text-[#8891aa]">Free Playground Canvas</span>
          <span class="font-['JetBrains_Mono',monospace] text-[11px] text-[#525c75]">Drop Docker images or K8s Clusters</span>
        </div>

        <div class="flex-1 p-6 relative z-10 flex flex-col gap-6">

          <!-- K8s Clusters -->
          <div v-for="(cluster, cIndex) in k8sClusters" :key="cluster.id"
               class="border-2 border-[#39ff8e]/30 rounded-xl bg-[#12151d] p-5 flex flex-col gap-4">
            <div class="flex items-center justify-between border-b border-[#252a38] pb-3 shrink-0">
              <div class="flex items-center gap-3">
                <span class="text-2xl">⎈</span>
                <input v-model="cluster.name" class="bg-transparent border-none text-[#39ff8e] font-bold text-[18px] outline-none w-40" @input="generateK8sYaml" />
                <span class="text-[10px] uppercase tracking-widest text-[#39ff8e]/50 px-2 py-0.5 border border-[#39ff8e]/20 rounded-full">K8S Namespace</span>
              </div>
              <button class="text-[#ff4545] hover:bg-[#ff4545]/10 px-3 py-1.5 rounded text-[12px] font-bold transition-colors" @click="k8sClusters.splice(cIndex, 1); generateK8sYaml()">✕ Remove</button>
            </div>

            <div
                class="min-h-[140px] border border-dashed rounded-xl p-4 flex flex-col gap-4 bg-[#0a0c10] transition-colors"
                :class="clusterDragOver === cluster.id ? 'border-[#39ff8e]/50 bg-[#39ff8e]/[0.02]' : 'border-[#252a38]'"
                @dragover.prevent="clusterDragOver = cluster.id"
                @dragleave.self="clusterDragOver = null"
                @drop.prevent="onClusterDrop(cluster, $event)"
            >
              <div v-if="cluster.nodes.length === 0 && cluster.workloads.length === 0"
                   class="text-[#525c75] text-[11px] flex items-center justify-center min-h-[100px] text-center">
                Drop Nodes, Deployments, Services, or Ingress here
              </div>

              <div v-if="cluster.nodes.length > 0 || cluster.workloads.length > 0"
                   class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">

                <!-- Nodes -->
                <div v-for="(node, nIndex) in cluster.nodes" :key="node.id"
                     class="border border-[#79b8ff]/40 rounded-xl bg-[#181c27] p-3 flex flex-col">
                  <div class="flex items-center justify-between mb-2 border-b border-[#252a38]/50 pb-2">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <span class="text-[16px] shrink-0">🖥️</span>
                      <input v-model="node.name" class="bg-transparent border-none text-[#79b8ff] font-semibold text-[13px] outline-none flex-1 min-w-0" @input="generateK8sYaml" />
                    </div>
                    <button class="text-[#ff4545] text-[14px] hover:bg-[#ff4545]/10 px-2 py-0.5 rounded shrink-0 ml-2" @click="cluster.nodes.splice(nIndex, 1); generateK8sYaml()">✕</button>
                  </div>
                  <div
                      class="flex-1 min-h-[70px] bg-[#0d0f14] border rounded-lg p-2 flex flex-col gap-2 transition-colors"
                      :class="nodeDragOver === node.id ? 'border-[#f8c555]/40 bg-[#f8c555]/[0.02]' : 'border-[#252a38]/80'"
                      @dragover.prevent="nodeDragOver = node.id"
                      @dragleave.self="nodeDragOver = null"
                      @drop.prevent="onPodDrop(node, $event)"
                  >
                    <div v-if="node.pods.length === 0" class="text-[#525c75] text-[10px] text-center my-auto py-1">Drop Image → Raw Pod</div>
                    <div v-for="(pod, pIndex) in node.pods" :key="pod.id"
                         class="border border-[#f8c555]/30 bg-[#1e2333] rounded px-2 py-1.5 flex items-start gap-2">
                      <span class="text-[14px] mt-0.5 shrink-0">📦</span>
                      <div class="flex flex-col flex-1 min-w-0">
                        <input v-model="pod.name" class="bg-transparent border-none text-[#f8c555] font-bold text-[11px] font-['JetBrains_Mono',monospace] outline-none w-full" @input="generateK8sYaml"/>
                        <input v-model="pod.image" class="bg-transparent border-none text-[#8891aa] text-[10px] font-['JetBrains_Mono',monospace] outline-none w-full" placeholder="image:latest" @input="generateK8sYaml"/>
                      </div>
                      <button class="text-[#ff4545] text-[12px] hover:bg-[#ff4545]/10 px-1.5 rounded shrink-0" @click="node.pods.splice(pIndex, 1); generateK8sYaml()">✕</button>
                    </div>
                  </div>
                </div>

                <!-- K8s Workload Cards -->
                <div v-for="(wk, wIndex) in cluster.workloads" :key="wk._uid"
                     class="border border-[#252a38] rounded-lg bg-[#181c27] flex flex-col overflow-hidden transition-all duration-150 hover:border-[#39ff8e]/40">
                  <div class="flex items-center gap-2.5 py-2 px-3 bg-[#12151d] border-b border-[#252a38] cursor-pointer" @click="toggleK8sWorkload(wk._uid)">
                    <span class="text-[16px] shrink-0">{{ getWorkloadIcon(wk.type) }}</span>
                    <input v-model="wk.name" class="flex-1 min-w-0 bg-transparent text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[12px] font-bold outline-none border-b border-transparent focus:border-[#39ff8e] transition-colors" @click.stop @input="generateK8sYaml" />
                    <span class="text-[9px] uppercase tracking-widest text-[#525c75] bg-[#252a38]/50 px-1.5 py-0.5 rounded">{{ wk.type }}</span>
                    <button class="text-[#525c75] text-[10px] p-1 rounded shrink-0 ml-1 hover:text-[#39ff8e]" @click.stop="toggleK8sWorkload(wk._uid)">{{ activeK8sWorkload === wk._uid ? '▲' : '▼' }}</button>
                    <button class="text-[#525c75] text-[12px] p-1 rounded shrink-0 hover:text-[#ff4545] hover:bg-[#ff4545]/10" @click.stop="cluster.workloads.splice(wIndex, 1); generateK8sYaml()">✕</button>
                  </div>

                  <div v-if="activeK8sWorkload === wk._uid" class="p-3 flex flex-col gap-3 bg-[#0d0f14]" @click.stop>
                    <template v-if="['deployment', 'replicaset'].includes(wk.type)">
                      <div class="flex gap-3">
                        <div class="flex flex-col gap-1 flex-1">
                          <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Image</label>
                          <input class="w-full bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model="wk.image" @input="generateK8sYaml" />
                        </div>
                        <div class="flex flex-col gap-1 w-[72px]">
                          <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Replicas</label>
                          <input type="number" min="1" class="w-full bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model.number="wk.replicas" @input="generateK8sYaml" />
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Container Ports</label>
                        <div v-for="(port, pi) in wk.ports" :key="pi" class="flex gap-1.5">
                          <input class="flex-1 bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model="wk.ports[pi]" placeholder="80" @input="generateK8sYaml" />
                          <button class="border border-[#252a38] text-[#525c75] rounded px-2 text-[10px] hover:text-[#ff4545] hover:border-[#ff4545]" @click="wk.ports.splice(pi, 1); generateK8sYaml()">✕</button>
                        </div>
                        <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded py-1 px-2 text-[10px] font-bold text-left hover:text-[#39ff8e] hover:border-[#39ff8e]" @click="wk.ports.push(''); generateK8sYaml()">+ Add Port</button>
                      </div>
                    </template>
                    <template v-else-if="wk.type === 'service'">
                      <div class="flex flex-col gap-1">
                        <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Service Type</label>
                        <select v-model="wk.serviceType" @change="generateK8sYaml" class="bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]">
                          <option>ClusterIP</option><option>NodePort</option><option>LoadBalancer</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Ports <span class="font-normal normal-case text-[#525c75]">(port:targetPort)</span></label>
                        <div v-for="(port, pi) in wk.ports" :key="pi" class="flex gap-1.5">
                          <input class="flex-1 bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model="wk.ports[pi]" placeholder="80:8080" @input="generateK8sYaml" />
                          <button class="border border-[#252a38] text-[#525c75] rounded px-2 text-[10px] hover:text-[#ff4545] hover:border-[#ff4545]" @click="wk.ports.splice(pi, 1); generateK8sYaml()">✕</button>
                        </div>
                        <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded py-1 px-2 text-[10px] font-bold text-left hover:text-[#39ff8e] hover:border-[#39ff8e]" @click="wk.ports.push(''); generateK8sYaml()">+ Add Port</button>
                      </div>
                    </template>
                    <template v-else-if="wk.type === 'ingress'">
                      <div class="flex gap-2">
                        <div class="flex flex-col gap-1 flex-1">
                          <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Host</label>
                          <input class="w-full bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model="wk.host" placeholder="api.example.com" @input="generateK8sYaml" />
                        </div>
                        <div class="flex flex-col gap-1 w-20">
                          <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Path</label>
                          <input class="w-full bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]" v-model="wk.path" placeholder="/" @input="generateK8sYaml" />
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-[9px] font-bold uppercase tracking-[1px] text-[#8891aa]">Target Service</label>
                        <select v-model="wk.targetService" @change="generateK8sYaml" class="bg-[#12151d] border border-[#252a38] rounded text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#39ff8e]">
                          <option value="">Select Service...</option>
                          <option v-for="svc in cluster.workloads.filter(w => w.type === 'service')" :key="svc._uid" :value="svc.name">{{ svc.name }}</option>
                        </select>
                      </div>
                    </template>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Divider -->
          <div v-if="k8sClusters.length > 0 && services.length > 0" class="h-px bg-[#252a38] w-full"></div>

          <!-- Docker Standalone Services -->
          <div v-if="services.length > 0" class="flex flex-col gap-3">
            <div class="flex items-center gap-2 px-1">
              <span class="text-[14px]">🐳</span>
              <span class="text-[13px] font-bold text-[#e8ecf5]">Standalone Docker Services</span>
              <span class="text-[11px] text-[#525c75] font-['JetBrains_Mono',monospace] ml-1">→ docker-compose.yml</span>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
              <div
                  v-for="(service, index) in services" :key="service._uid"
                  class="border rounded-xl transition-all duration-150 overflow-hidden bg-[#181c27] flex flex-col"
                  :class="activeService === service._uid ? 'border-[#00e5ff] shadow-[0_0_0_1px_rgba(0,229,255,0.08),0_4px_20px_rgba(0,229,255,0.06)]' : 'border-[#252a38] hover:border-[#2e3549]'"
                  draggable="true"
                  @dragstart="onCardDragStart($event, index)"
                  @dragover.prevent="onCardDragOver($event, index)"
                  @drop.prevent="onCardDrop($event, index)"
              >
                <div class="flex items-center gap-2.5 py-3 px-4 bg-[#12151d] border-b border-[#252a38] cursor-pointer" @click="toggleService(service._uid)">
                  <span class="text-[20px] shrink-0 cursor-grab active:cursor-grabbing" @click.stop>{{ service.icon }}</span>
                  <input v-model="service.name" class="flex-1 min-w-0 bg-transparent border-none border-b border-transparent text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[14px] font-bold outline-none py-0.5 px-1 focus:border-[#00e5ff] transition-colors" placeholder="service-name" @click.stop @input="generateYaml" />
                  <button class="text-[#525c75] text-[12px] p-1.5 rounded shrink-0 ml-1 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all" @click.stop="toggleService(service._uid)">{{ activeService === service._uid ? '▲' : '▼' }}</button>
                  <button class="text-[#525c75] text-[14px] p-1.5 rounded shrink-0 hover:text-[#ff4545] hover:bg-[#ff4545]/10 transition-all" @click.stop="removeService(index)">✕</button>
                </div>

                <div v-if="activeService === service._uid" class="px-4 pb-4 pt-3 flex flex-col gap-3" @click.stop>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Image</label>
                    <input class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2.5 outline-none focus:border-[#00e5ff]" v-model="service.image" placeholder="nginx:latest" @input="generateYaml" />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Ports <span class="font-normal normal-case text-[#525c75]">(host:container)</span></label>
                    <div v-for="(port, pi) in service.ports" :key="pi" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.ports[pi]" placeholder="8080:80" @input="generateYaml" />
                      <button class="border border-[#252a38] text-[#525c75] rounded-md px-2 text-[12px] hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.ports.splice(pi, 1); generateYaml()">✕</button>
                    </div>
                    <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.ports.push(''); generateYaml()">+ Add Port</button>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Environment <span class="font-normal normal-case text-[#525c75]">(KEY=VALUE)</span></label>
                    <div v-for="(env, ei) in service.environment" :key="ei" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.environment[ei]" placeholder="NODE_ENV=production" @input="generateYaml" />
                      <button class="border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.environment.splice(ei, 1); generateYaml()">✕</button>
                    </div>
                    <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.environment.push(''); generateYaml()">+ Add Env</button>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Volumes <span class="font-normal normal-case text-[#525c75]">(host:container)</span></label>
                    <div v-for="(vol, vi) in service.volumes" :key="vi" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.volumes[vi]" placeholder="./data:/var/data" @input="generateYaml" />
                      <button class="border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.volumes.splice(vi, 1); generateYaml()">✕</button>
                    </div>
                    <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.volumes.push(''); generateYaml()">+ Add Volume</button>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Networks</label>
                    <div v-for="(net, ni) in service.networks" :key="ni" class="flex gap-1.5">
                      <input class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.networks[ni]" placeholder="app-network" @input="generateYaml" />
                      <button class="border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.networks.splice(ni, 1); generateYaml()">✕</button>
                    </div>
                    <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.networks.push(''); generateYaml()">+ Add Network</button>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Depends On</label>
                    <div v-for="(dep, di) in service.depends_on" :key="di" class="flex gap-1.5">
                      <select class="flex-1 bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1 px-2 outline-none focus:border-[#00e5ff]" v-model="service.depends_on[di]" @change="generateYaml">
                        <option disabled value="">Select service...</option>
                        <option v-for="other in services.filter(s => s._uid !== service._uid)" :key="other._uid" :value="other.name">{{ other.name }}</option>
                      </select>
                      <button class="border border-[#252a38] text-[#525c75] rounded-md px-2 hover:text-[#ff4545] hover:border-[#ff4545]" @click="service.depends_on.splice(di, 1); generateYaml()">✕</button>
                    </div>
                    <button class="border border-dashed border-[#2e3549] text-[#525c75] rounded-md py-1.5 px-2 text-[11px] font-bold text-left hover:text-[#00e5ff] hover:border-[#00e5ff]" @click="service.depends_on.push(''); generateYaml()">+ Add Dependency</button>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Restart</label>
                    <select v-model="service.restart" @change="generateYaml" class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2 outline-none focus:border-[#00e5ff]">
                      <option value="">none</option>
                      <option value="always">always</option>
                      <option value="unless-stopped">unless-stopped</option>
                      <option value="on-failure">on-failure</option>
                    </select>
                  </div>

                  <div class="flex flex-col gap-1.5 pt-2 border-t border-[#252a38]">
                    <label class="text-[10px] font-bold uppercase tracking-[1px] text-[#8891aa]">Healthcheck</label>
                    <input class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2.5 outline-none focus:border-[#00e5ff] w-full" v-model="service.healthcheck.test" placeholder="CMD curl -f http://localhost" @input="generateYaml" />
                    <div class="grid grid-cols-3 gap-2">
                      <input class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2 outline-none focus:border-[#00e5ff]" v-model="service.healthcheck.interval" placeholder="30s" @input="generateYaml" />
                      <input class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2 outline-none focus:border-[#00e5ff]" v-model="service.healthcheck.timeout" placeholder="10s" @input="generateYaml" />
                      <input type="number" class="bg-[#0d0f14] border border-[#252a38] rounded-md text-[#e8ecf5] font-['JetBrains_Mono',monospace] text-[11px] py-1.5 px-2 outline-none focus:border-[#00e5ff]" v-model.number="service.healthcheck.retries" placeholder="3" @input="generateYaml" />
                    </div>
                    <div class="flex gap-2 text-[9px] text-[#525c75] font-['JetBrains_Mono',monospace] px-0.5">
                      <span>interval</span><span class="flex-1 text-center">timeout</span><span>retries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="k8sClusters.length === 0 && services.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center opacity-[0.12]">
              <div class="text-[80px] leading-none">⬡</div>
              <p class="text-[20px] font-extrabold tracking-widest mt-4 uppercase">Freestyle Canvas</p>
              <p class="text-[14px] mt-2">Drag Docker images or K8s Clusters here</p>
            </div>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════════
           OUTPUT — Right Panel
      ══════════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col w-[440px] bg-[#0d0f14] border-l border-[#252a38] shrink-0 overflow-hidden">

        <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#252a38] shrink-0 gap-2">
          <div class="flex gap-1.5">
            <button
                class="px-3 py-1 font-bold text-[11px] uppercase tracking-[1px] rounded transition-all"
                :class="outputTab === 'docker' ? 'bg-[#00e5ff] text-black' : 'text-[#8891aa] hover:bg-[#252a38] hover:text-[#e8ecf5]'"
                @click="outputTab = 'docker'"
            >🐳 docker-compose</button>
            <button
                class="px-3 py-1 font-bold text-[11px] uppercase tracking-[1px] rounded transition-all"
                :class="outputTab === 'k8s' ? 'bg-[#39ff8e] text-black' : 'text-[#8891aa] hover:bg-[#252a38] hover:text-[#e8ecf5]'"
                @click="outputTab = 'k8s'"
            >⎈ k8s manifest</button>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="copiedAll" class="text-[11px] font-['JetBrains_Mono',monospace] text-[#39ff8e]">✓ Copied!</span>
            <button class="flex items-center gap-1.5 border border-[#2e3549] text-[#8891aa] py-1.5 px-3 rounded-lg text-[12px] font-semibold hover:text-[#e8ecf5] hover:border-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all" @click="copyYaml">⎘ Copy</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <pre v-if="outputTab === 'docker'" class="font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#8891aa] whitespace-pre"><code v-html="highlightedYaml"></code></pre>

          <div v-else-if="outputTab === 'k8s'">
            <pre v-if="k8sFiles.length === 0" class="font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#525c75] italic whitespace-pre"><code v-html="highlightedK8sYaml"></code></pre>
            <div v-for="(file, fileIndex) in highlightedK8sFiles" :key="fileIndex" class="mb-5 border border-[#252a38] rounded-lg bg-[#12151d] overflow-hidden">
              <div class="flex items-center justify-between px-3 py-2 bg-[#181c27] border-b border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#8891aa]">
                <div class="flex items-center gap-2"><span>📄</span> {{ file.name }}</div>
                <div class="flex items-center gap-3">
                  <span v-if="copiedFileIndex === fileIndex" class="text-[10px] text-[#39ff8e]">✓ Copied!</span>
                  <button class="text-[#525c75] hover:text-[#39ff8e] transition-colors" @click="copySingleFile(file, fileIndex)">⎘</button>
                  <button class="text-[#525c75] hover:text-[#00e5ff] transition-colors" @click="downloadSingleFile(file)">↓</button>
                </div>
              </div>
              <pre class="p-4 font-['JetBrains_Mono',monospace] text-[12.5px] leading-[1.8] text-[#8891aa] whitespace-pre overflow-x-auto"><code v-html="file.html"></code></pre>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 py-2 px-5 border-t border-[#252a38] text-[11px] font-['JetBrains_Mono',monospace] text-[#525c75] shrink-0">
          <template v-if="outputTab === 'docker'">
            <span>{{ services.length }} services</span>
            <span class="text-[#252a38]">•</span>
            <span>{{ uniqueNetworks.length }} networks</span>
            <span class="text-[#252a38]">•</span>
            <span>{{ uniqueVolumes.length }} volumes</span>
            <span class="text-[#00e5ff] ml-auto">v3.8</span>
          </template>
          <template v-else>
            <span>{{ k8sClusters.length }} clusters</span>
            <span class="text-[#252a38]">•</span>
            <span>{{ k8sTotalNodes }} nodes</span>
            <span class="text-[#252a38]">•</span>
            <span>{{ k8sTotalWorkloads }} workloads</span>
            <span class="text-[#39ff8e] ml-auto">API v1</span>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const outputTab = ref('docker')

const k8sInfraPresets = [
  { id: 'cluster', label: 'Cluster',     type: 'cluster', icon: '⎈' },
  { id: 'node',    label: 'Worker Node', type: 'node',    icon: '🖥️' },
]
const k8sWorkloadPresets = [
  { id: 'deployment', label: 'Deployment', type: 'deployment', icon: '🔄' },
  { id: 'replicaset', label: 'ReplicaSet', type: 'replicaset', icon: '📑' },
  { id: 'service',    label: 'Service',    type: 'service',    icon: '🔌' },
  { id: 'ingress',    label: 'Ingress',    type: 'ingress',    icon: '🚪' },
]
const presets = [
  { id: 'nginx',    label: 'Nginx',      image: 'nginx:alpine',          icon: '🌐', defaultPorts: ['80:80'],                    defaultEnv: [] },
  { id: 'postgres', label: 'PostgreSQL', image: 'postgres:16-alpine',    icon: '🐘', defaultPorts: ['5432:5432'],                defaultEnv: ['POSTGRES_PASSWORD=secret','POSTGRES_DB=app'] },
  { id: 'mysql',    label: 'MySQL',      image: 'mysql:8',               icon: '🐬', defaultPorts: ['3306:3306'],                defaultEnv: ['MYSQL_ROOT_PASSWORD=secret','MYSQL_DATABASE=app'] },
  { id: 'redis',    label: 'Redis',      image: 'redis:7-alpine',        icon: '🔴', defaultPorts: ['6379:6379'],                defaultEnv: [] },
  { id: 'mongo',    label: 'MongoDB',    image: 'mongo:7',               icon: '🍃', defaultPorts: ['27017:27017'],              defaultEnv: ['MONGO_INITDB_ROOT_USERNAME=root','MONGO_INITDB_ROOT_PASSWORD=secret'] },
  { id: 'node',     label: 'Node.js',    image: 'node:20-alpine',        icon: '💚', defaultPorts: ['3000:3000'],                defaultEnv: ['NODE_ENV=production'] },
  { id: 'python',   label: 'Python',     image: 'python:3.12-slim',      icon: '🐍', defaultPorts: ['8000:8000'],                defaultEnv: [] },
  { id: 'rabbitmq', label: 'RabbitMQ',   image: 'rabbitmq:3-management', icon: '🐰', defaultPorts: ['5672:5672','15672:15672'],  defaultEnv: [] },
  { id: 'minio',    label: 'MinIO',      image: 'minio/minio:latest',    icon: '📦', defaultPorts: ['9000:9000','9001:9001'],    defaultEnv: ['MINIO_ROOT_USER=admin','MINIO_ROOT_PASSWORD=secret'] },
  { id: 'traefik',  label: 'Traefik',    image: 'traefik:v3',            icon: '🔀', defaultPorts: ['80:80','8080:8080'],        defaultEnv: [] },
  { id: 'grafana',  label: 'Grafana',    image: 'grafana/grafana:latest', icon: '📊', defaultPorts: ['3000:3000'],               defaultEnv: ['GF_SECURITY_ADMIN_PASSWORD=admin'] },
  { id: 'custom',   label: 'Custom',     image: 'my-image:latest',       icon: '⚙️', defaultPorts: [],                         defaultEnv: [] },
]

// ── State ─────────────────────────────────────────────────────────────────────
const k8sClusters       = ref([])
const services          = ref([])
const activeService     = ref(null)
const activeK8sWorkload = ref(null)
const isDragOver        = ref(false)
const clusterDragOver   = ref(null)
const nodeDragOver      = ref(null)
const copiedAll         = ref(false)
const copiedFileIndex   = ref(null)
const yamlOutput        = ref('')
const k8sOutput         = ref('')
const k8sFiles          = ref([])

// FIX: Single unified drag state object — eliminates race conditions between
// the old split dragSource / dragItem / dragCardIndex variables
let drag = { source: null, item: null, cardIndex: null }
let uid  = 0
let k8sUid = 0

// ── Drag ──────────────────────────────────────────────────────────────────────
function onPaletteDragStart(e, preset) {
  drag = { source: 'palette', item: preset, cardIndex: null }
  e.dataTransfer.effectAllowed = 'copy'
}
function onCardDragStart(e, index) {
  drag = { source: 'card', item: null, cardIndex: index }
  e.dataTransfer.effectAllowed = 'move'
  e.stopPropagation()
}
function onCardDragOver(e) {
  if (drag.source === 'card') e.dataTransfer.dropEffect = 'move'
}
function onCardDrop(e, targetIndex) {
  if (drag.source === 'card' && drag.cardIndex !== null && drag.cardIndex !== targetIndex) {
    const arr  = [...services.value]
    const item = arr.splice(drag.cardIndex, 1)[0]
    arr.splice(targetIndex, 0, item)
    services.value = arr
    generateYaml()
  }
  isDragOver.value = false
  drag.cardIndex   = null
  e.stopPropagation()
}

function onCanvasDrop(e) {
  isDragOver.value = false
  if (drag.source !== 'palette' || !drag.item) return
  const { item } = drag
  if (item.type === 'cluster') {
    k8sClusters.value.push({ id: ++k8sUid, name: nextName(k8sClusters.value, 'cluster'), nodes: [], workloads: [] })
    generateK8sYaml()
  } else if (!['node','deployment','replicaset','service','ingress'].includes(item.type)) {
    addService(item)
  }
  drag = { source: null, item: null, cardIndex: null }
}

function onClusterDrop(cluster, e) {
  clusterDragOver.value = null
  if (drag.source !== 'palette' || !drag.item) return
  const { item } = drag
  if (item.type === 'node') {
    cluster.nodes.push({ id: ++k8sUid, name: nextName(cluster.nodes, 'node'), pods: [] })
    generateK8sYaml()
  } else if (['deployment','replicaset','service','ingress'].includes(item.type)) {
    cluster.workloads.push(makeWorkload(item, cluster))
    generateK8sYaml()
  } else if (!['cluster','node'].includes(item.type)) {
    // Docker image dropped into cluster → auto-create Deployment
    cluster.workloads.push(makeWorkload({ ...item, type: 'deployment' }, cluster))
    generateK8sYaml()
  }
  e.stopPropagation()
}

function onPodDrop(node, e) {
  nodeDragOver.value = null
  if (drag.source !== 'palette' || !drag.item) return
  const { item } = drag
  if (!['node','cluster','deployment','replicaset','service','ingress'].includes(item.type)) {
    node.pods.push({ id: ++k8sUid, name: nextName(node.pods, `pod-${item.id||'app'}`), image: item.image || 'ubuntu:latest' })
    generateK8sYaml()
  }
  e.stopPropagation()
}

function makeWorkload(item, cluster) {
  return {
    _uid:          ++k8sUid,
    type:          item.type,
    name:          nextName(cluster.workloads, item.id || item.type),
    image:         item.image || 'nginx:latest',
    replicas:      1,
    ports:         (item.defaultPorts || []).map(p => p.split(':')[0]),
    serviceType:   'ClusterIP',
    host:          'example.com',
    path:          '/',
    targetService: '',
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function nextName(list, base) {
  if (!list.some(i => i.name === base)) return base
  let n = 2; while (list.some(i => i.name === `${base}-${n}`)) n++
  return `${base}-${n}`
}
function getWorkloadIcon(type) { return k8sWorkloadPresets.find(p => p.type === type)?.icon ?? '📦' }
function toggleK8sWorkload(uid_) { activeK8sWorkload.value = activeK8sWorkload.value === uid_ ? null : uid_ }

// ── Docker Services ───────────────────────────────────────────────────────────
function addService(preset) {
  services.value.push({
    _uid: ++uid, _baseId: preset.id, icon: preset.icon,
    name:        nextName(services.value, preset.id),
    image:       preset.image,
    ports:       [...preset.defaultPorts],
    environment: [...preset.defaultEnv],
    volumes:     [], networks:  [], depends_on: [], restart: '',
    healthcheck: { test: '', interval: '', timeout: '', retries: '' },
  })
  generateYaml()
}
function removeService(index) {
  const r = services.value.splice(index, 1)[0]
  if (activeService.value === r._uid) activeService.value = null
  generateYaml()
}
function toggleService(uid_) { activeService.value = activeService.value === uid_ ? null : uid_ }
function clearAll() {
  services.value = []; k8sClusters.value = []
  activeService.value = null; activeK8sWorkload.value = null
  generateYaml(); generateK8sYaml()
}

// ── Computed ──────────────────────────────────────────────────────────────────
const uniqueNetworks = computed(() => { const s = new Set(); services.value.forEach(v => v.networks.forEach(n => n && s.add(n))); return [...s] })
const uniqueVolumes  = computed(() => { const s = new Set(); services.value.forEach(v => v.volumes.forEach(vol => { if (vol && !vol.startsWith('./') && !vol.startsWith('/')) { const n = vol.split(':')[0]; if (n) s.add(n) } })); return [...s] })
const k8sTotalNodes     = computed(() => k8sClusters.value.reduce((a,c) => a + c.nodes.length, 0))
const k8sTotalWorkloads = computed(() => k8sClusters.value.reduce((a,c) => a + c.workloads.length + c.nodes.reduce((b,n) => b + n.pods.length, 0), 0))

// ── Docker YAML ───────────────────────────────────────────────────────────────
function generateYaml() {
  if (!services.value.length) { yamlOutput.value = '# Drop Docker images onto the canvas\n# to start building your docker-compose stack'; return }
  const L = ['version: "3.8"', '', 'services:']
  for (const s of services.value) {
    const n = s.name || s._baseId || 'service'
    L.push(`  ${n}:`); L.push(`    image: ${s.image || 'undefined'}`)
    const ports = s.ports.filter(Boolean); if (ports.length) { L.push('    ports:'); ports.forEach(p => L.push(`      - "${p}"`)) }
    const envs  = s.environment.filter(Boolean); if (envs.length) { L.push('    environment:'); envs.forEach(e => L.push(`      - ${e}`)) }
    const vols  = s.volumes.filter(Boolean); if (vols.length) { L.push('    volumes:'); vols.forEach(v => L.push(`      - ${v}`)) }
    const nets  = s.networks.filter(Boolean); if (nets.length) { L.push('    networks:'); nets.forEach(n => L.push(`      - ${n}`)) }
    const deps  = s.depends_on.filter(Boolean); if (deps.length) { L.push('    depends_on:'); deps.forEach(d => L.push(`      - ${d}`)) }
    if (s.restart) L.push(`    restart: ${s.restart}`)
    if (s.healthcheck?.test) {
      L.push('    healthcheck:')
      const t = s.healthcheck.test; const raw = /^(CMD|CMD-SHELL|NONE|\[)/.test(t)
      L.push(`      test: ${raw ? t : `["CMD-SHELL", "${t}"]`}`)
      if (s.healthcheck.interval) L.push(`      interval: ${s.healthcheck.interval}`)
      if (s.healthcheck.timeout)  L.push(`      timeout: ${s.healthcheck.timeout}`)
      if (s.healthcheck.retries)  L.push(`      retries: ${s.healthcheck.retries}`)
    }
    L.push('')
  }
  if (uniqueNetworks.value.length) { L.push('networks:'); uniqueNetworks.value.forEach(n => { L.push(`  ${n}:`); L.push('    driver: bridge') }); L.push('') }
  if (uniqueVolumes.value.length) { L.push('volumes:'); uniqueVolumes.value.forEach(v => L.push(`  ${v}:`)) }
  yamlOutput.value = L.join('\n').trimEnd()
}

// ── K8s YAML ──────────────────────────────────────────────────────────────────
function generateK8sYaml() {
  if (!k8sClusters.value.length) { k8sOutput.value = '# Drop a Cluster onto the canvas\n# then add Nodes and Workloads inside it'; k8sFiles.value = []; return }
  const files = []
  k8sClusters.value.forEach(cluster => {
    files.push({ name: `namespace-${cluster.name}.yaml`, content: `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: ${cluster.name}` })
    cluster.workloads.forEach(w => {
      let c = ''
      if (w.type === 'deployment' || w.type === 'replicaset') {
        const kind = w.type === 'deployment' ? 'Deployment' : 'ReplicaSet'
        c = `apiVersion: apps/v1\nkind: ${kind}\nmetadata:\n  name: ${w.name}\n  namespace: ${cluster.name}\nspec:\n  replicas: ${w.replicas}\n  selector:\n    matchLabels:\n      app: ${w.name}\n  template:\n    metadata:\n      labels:\n        app: ${w.name}\n    spec:\n      containers:\n        - name: main\n          image: ${w.image}`
        const vp = w.ports.filter(Boolean)
        if (vp.length) { c += `\n          ports:`; vp.forEach(p => { const n = parseInt(p.split(':').pop()); if (!isNaN(n)) c += `\n            - containerPort: ${n}` }) }
      } else if (w.type === 'service') {
        c = `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${w.name}\n  namespace: ${cluster.name}\nspec:\n  type: ${w.serviceType}\n  selector:\n    app: ${w.name}\n  ports:`
        const vp = w.ports.filter(Boolean)
        if (vp.length) { vp.forEach(p => { const [port, tgt] = p.split(':'); if (port) c += `\n    - port: ${port}\n      targetPort: ${tgt||port}` }) }
        else c += `\n    - port: 80\n      targetPort: 80`
      } else if (w.type === 'ingress') {
        c = `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: ${w.name}\n  namespace: ${cluster.name}\nspec:\n  rules:\n    - host: ${w.host||'example.com'}\n      http:\n        paths:\n          - path: ${w.path||'/'}\n            pathType: Prefix\n            backend:\n              service:\n                name: ${w.targetService||'my-service'}\n                port:\n                  number: 80`
      }
      if (c) files.push({ name: `${w.type}-${w.name}.yaml`, content: c })
    })
    cluster.nodes.forEach(node => node.pods.forEach(pod => files.push({
      name: `pod-${pod.name}.yaml`,
      content: `apiVersion: v1\nkind: Pod\nmetadata:\n  name: ${pod.name}\n  namespace: ${cluster.name}\n  labels:\n    node: ${node.name}\nspec:\n  nodeName: ${node.name}\n  containers:\n    - name: main\n      image: ${pod.image}`
    })))
  })
  k8sFiles.value  = files
  k8sOutput.value = files.map(f => f.content).join('\n---\n')
}

// ── Highlight ─────────────────────────────────────────────────────────────────
function hl(raw) {
  return raw
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/^(#.*)$/gm, "<span class='y-comment'>$1</span>")
      .replace(/^(\s*)([\w-]+)(:)(?=\s|$)/gm, "$1<span class='y-key'>$2</span><span class='y-colon'>$3</span>")
      .replace(/"([^"]*)"/g, "<span class='y-string'>\"$1\"</span>")
      .replace(/\b(true|false|null)\b/g, "<span class='y-bool'>$1</span>")
      .replace(/\b(\d+)\b/g, "<span class='y-num'>$1</span>")
}
const highlightedYaml     = computed(() => hl(yamlOutput.value))
const highlightedK8sYaml  = computed(() => hl(k8sOutput.value))
const highlightedK8sFiles = computed(() => k8sFiles.value.map(f => ({ ...f, html: hl(f.content) })))

// ── Copy / Download ───────────────────────────────────────────────────────────
function copyYaml() {
  const txt = outputTab.value === 'docker' ? yamlOutput.value : k8sOutput.value
  navigator.clipboard.writeText(txt).then(() => { copiedAll.value = true; setTimeout(() => copiedAll.value = false, 2000) })
}
function downloadYaml() {
  dl(outputTab.value === 'docker' ? yamlOutput.value : k8sOutput.value, outputTab.value === 'docker' ? 'docker-compose.yml' : 'k8s-manifest.yaml')
}
function copySingleFile(file, index) {
  navigator.clipboard.writeText(file.content).then(() => { copiedFileIndex.value = index; setTimeout(() => copiedFileIndex.value = null, 2000) })
}
function downloadSingleFile(file) { dl(file.content, file.name) }
function dl(content, filename) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([content], { type: 'text/yaml' })), download: filename })
  a.click(); URL.revokeObjectURL(a.href)
}

onMounted(() => { generateYaml(); generateK8sYaml() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap');

:deep(.y-key)     { color: #79b8ff; }
:deep(.y-colon)   { color: #525c75; }
:deep(.y-string)  { color: #9ecbff; }
:deep(.y-comment) { color: #525c75; font-style: italic; }
:deep(.y-bool)    { color: #ff9520; }
:deep(.y-num)     { color: #f8c555; }

::-webkit-scrollbar         { width: 4px; height: 4px; }
::-webkit-scrollbar-track   { background: transparent; }
::-webkit-scrollbar-thumb   { background: #2e3549; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #525c75; }
</style>