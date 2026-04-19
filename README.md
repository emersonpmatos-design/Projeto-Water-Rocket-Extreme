# 🚀 AeroPET Pro Extreme

**AeroPET Pro Extreme** é um simulador profissional de foguetes de garrafa PET (hidropneumáticos) de alta fidelidade, desenvolvido para dispositivos Web. Ele utiliza modelos matemáticos avançados para prever a trajetória, apogeu e velocidade com precisão de competição.

![Status da Simulação](https://img.shields.io/badge/Status-Estável-00ff66?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![Tech Stack](https://img.shields.io/badge/TypeScript-007acc?style=for-the-badge&logo=typescript&logoColor=white)

## 🛠️ Diferenciais Técnicos

Diferente de simuladores básicos, o AeroPET utiliza:
- **Integrador RK-4**: Método Runge-Kutta de 4ª ordem operando a 500Hz para garantir curvas suaves e precisas.
- **Modelo de 3 Fases**:
  1. **Hidráulica**: Expulsão de água com pressão adiabática.
  2. **Pneumática Crítica**: Expulsão de ar considerando fluxo sônico (*Choked Flow*).
  3. **Ballística**: Voo puramente inercial com modelagem de arrasto aerodinâmico ($C_d$).
- **Dashboard Especialista**: Interface estilo terminal técnico para análise de telemetria em tempo real.

## 📊 Métricas Monitoradas
- **Alcance Total (m)**
- **Altitude de Apogeu (m)**
- **Velocidade de Pico (km/h)**
- **Sequenciamento de Fases (s)**

## 🚀 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧪 Parâmetros de Geometria Ajustáveis
- Volume da Garrafa (0.5L a 3.0L)
- Diâmetro do Bico/Nozzle (mm)
- Coeficiente de Arrasto ($C_d$)

## 📄 Licença
Distribuído sob a licença Apache-2.0. Veja `LICENSE` para mais informações.
