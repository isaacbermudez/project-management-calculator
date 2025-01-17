<script>
  let initialInvestment = 0;
  let annualCashInflow = 0;
  let paybackPeriod = 0;

  function calculatePaybackPeriod() {
    if (annualCashInflow > 0) {
      paybackPeriod = initialInvestment / annualCashInflow;
    } else {
      paybackPeriod = 0;
    }
  }
</script>

<div class="card">
  <h2>Periodo de Recuperación</h2>
  <p class="description">
    El Periodo de Recuperación es el tiempo necesario para recuperar el costo de una inversión.
  </p>

  <label for="initialInvestment">Inversión Inicial:</label>
  <input
    type="number"
    id="initialInvestment"
    bind:value={initialInvestment}
    placeholder="Ingrese la inversión inicial"
  />

  <label for="annualCashInflow">Ingreso Anual:</label>
  <input
    type="number"
    id="annualCashInflow"
    bind:value={annualCashInflow}
    placeholder="Ingrese el ingreso anual"
  />

  <button class="calculate" on:click={calculatePaybackPeriod}>
    Calcular Periodo de Recuperación
  </button>
  <p class="result">Periodo de Recuperación: {paybackPeriod.toFixed(2)} años</p>
</div>

<style>
  /* Same styling as ROI component */
  .card { /* Copy card styles from ROI */ }
  h2, .description, label, input, button.calculate, .result { /* Copy styles */ }
</style>
