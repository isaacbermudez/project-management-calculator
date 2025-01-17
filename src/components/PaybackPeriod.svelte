<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let initialInvestment = 0;
  let annualCashInflows = 0;
  let paybackPeriod = '';

  // Formula for rendering with KaTeX
  const formula = `
    \\text{Payback Period} = \\frac{\\text{Inversión Inicial}}{\\text{Entradas de Efectivo Anuales}}
  `;

  function calculatePaybackPeriod() {
    if (initialInvestment === 0 || annualCashInflows === 0) {
      paybackPeriod = 'Error: División por cero';
    } else if (initialInvestment < 0) {
      paybackPeriod = 'Error: Inversión negativa';
    } else if (annualCashInflows < 0) {
      paybackPeriod = 'Error: Entradas de efectivo negativas';
    } else {
      paybackPeriod = (initialInvestment / annualCashInflows).toFixed(2) + ' años';
    }
  }
</script>

<div class="payback-container">
  <h2>Periodo de Recuperación (Payback Period)</h2>

  <!-- Render Formula with KaTeX -->
  <div class="formula">
    <strong>Fórmula:</strong>
    <div class="math">
      {@html katex.renderToString(formula, { throwOnError: false })}
    </div>
  </div>

  <!-- Input Fields -->
  <label for="investment">Inversión Inicial:</label>
  <input id="investment" type="number" bind:value={initialInvestment} />

  <label for="cashInflows">Entradas de Efectivo Anuales:</label>
  <input id="cashInflows" type="number" bind:value={annualCashInflows} />

  <button on:click={calculatePaybackPeriod} class="calculate">Calcular</button>

  <!-- Display Result -->
  <p style="color: blueviolet; font-weight: bold;">Periodo de Recuperación: {paybackPeriod}</p>
</div>

<style>
  .payback-container {
    margin: 20px auto;
    padding: 20px;
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 600px;
  }

  h2 {
    text-align: center;
    color: #007bff;
    margin-bottom: 20px;
  }

  .formula {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    color: #495057;
  }

  .math {
    font-family: 'Courier New', monospace;
    font-weight: bold;
  }

  label {
    display: block;
    margin: 10px 0 5px;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
  }

  .calculate {
    width: 100%;
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .calculate:hover {
    background-color: #0056b3;
  }
</style>
