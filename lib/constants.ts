// Esta lista agora é a "fonte da verdade"
export const equipmentTypes = [
  { value: "dvr", label: "DVR (Gravador)" },
  { value: "nvr", label: "NVR (Gravador de Rede)" },
  { value: "camera_bullet", label: "Câmera Bullet" },
  { value: "camera_dome", label: "Câmera Dome" },
  { value: "camera_ip", label: "Câmera IP" },
  { value: "central_alarme", label: "Central de Alarme" },
  { value: "sensor_presenca", label: "Sensor de Presença (IVP)" },
  { value: "sensor_magnetico", label: "Sensor Magnético (Abertura)" },
  { value: "sirene", label: "Sirene" },
  { value: "controladora_acesso", label: "Controladora de Acesso" },
  { value: "leitor_biometrico", label: "Leitor Biométrico" },
  { value: "leitor_cartao", label: "Leitor de Cartão (Tag)" },
  { value: "fechadura_eletromagnetica", label: "Fechadura Eletromagnética" },
  { value: "fechadura_eletrica", label: "Fechadura Elétrica (Eletroímã)" },
  { value: "botoeira", label: "Botoeira (Botão de Saída)" },
  { value: "cerca_eletrica", label: "Central de Cerca Elétrica" },
  { value: "video_porteiro", label: "Vídeo Porteiro" },
  { value: "nobreak", label: "Nobreak" },
  { value: "fonte_alimentacao", label: "Fonte de Alimentação" },
  { value: "outros", label: "Outros" },
] as const; // 'as const' ajuda o TypeScript

// Criamos um "mapa" para tradução rápida
// --- AQUI ESTÁ A CORREÇÃO ---
// Definimos explicitamente o tipo do Map como <string, string>
export const equipmentTypeMap = new Map<string, string>(
  equipmentTypes.map(item => [item.value, item.label])
);

// Função auxiliar para traduzir o valor
export const getEquipmentLabel = (value: string) => {
  // Agora 'value' (string) é compatível com a chave do Map (string)
  return equipmentTypeMap.get(value) || value;
};

