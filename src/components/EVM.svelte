<script>
  let ev = 0; // Valor Ganado
  let pv = 0; // Valor Planificado
  let ac = 0; // Costo Actual
  let cpi = 0; // Índice de Rendimiento de Costo
  let spi = 0; // Índice de Rendimiento de Cronograma

  function calculateEVM() {
    if (ac > 0) {
      cpi = ev / ac;
    } else {
      cpi = 0;
    }

    if (pv > 0) {
      spi = ev / pv;
    } else {
      spi = 0;
    }
  }
</script>

<div class="card">
  <h2>Gestión de Valor Ganado (EVM)</h2>
  <p class="description">
    EVM es una técnica de gestión de proyectos para medir el desempeño y progreso del proyecto.
  </p>

  <label for="ev">Valor Ganado (EV):</label>
  <input
    type="number"
    id="ev"
    bind:value={ev}
    placeholder="Ingrese el valor ganado"
  />

  <label for="pv">Valor Planificado (PV):</label>
  <input
    type="number"
    id="pv"
    bind:value={pv}
    placeholder="Ingrese el valor planificado"
  />

  <label for="ac">Costo Actual (AC):</label>
  <input
    type="number"
    id="ac"
    bind:value={ac}
    placeholder="Ingrese el costo actual"
  />

  <button class="calculate" on:click={calculateEVM}>
    Calcular EVM
  </button>
  <p class="result">CPI: {cpi.toFixed(2)} | SPI: {spi.toFixed(2)}</p>
</div>


<style>
  /* Same styling as ROI component */
  .card { /* Copy card styles from ROI */ }
  h2, .description, label, input, button.calculate, .result { /* Copy styles */ }
</style>
