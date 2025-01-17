<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let earnedValue = 0;
  let actualCost = 0;
  let plannedValue = 0;
  let cpi = 0;
  let spi = 0;

  const cpiFormula = `
    CPI = \\frac{\\text{Valor Ganado (EV)}}{\\text{Costo Actual (AC)}}
  `;
  const spiFormula = `
    SPI = \\frac{\\text{Valor Ganado (EV)}}{\\text{Valor Planificado (PV)}}
  `;

  function calculateEVM() {
    if (actualCost === 0) {
      cpi = "Error: División por cero";
    } else {
      cpi = (earnedValue / actualCost).toFixed(2);
    }

    if (plannedValue === 0) {
      spi = "Error: División por cero";
    } else {
      spi = (earnedValue / plannedValue).toFixed(2);
    }
  }
</script>

<div class="evm-container">
  <h2>Gestión del Valor Ganado (EVM)</h2>

  <!-- Render CPI Formula with KaTeX -->
  <div class="formula">
    <strong>Fórmula (CPI):</strong>
    <div class="math">
      {@html katex.renderToString(cpiFormula, { throwOnError: false })}
    </div>
  </div>

  <!-- Render SPI Formula with KaTeX -->
  <div class="formula">
    <strong>Fórmula (SPI):</strong>
    <div class="math">
      {@html katex.renderToString(spiFormula, { throwOnError: false })}
    </div>
  </div>

  <!-- Input Fields -->
  <label for="earnedValue">Valor Ganado (EV):</label>
  <input id="earnedValue" type="number" bind:value={earnedValue} />

  <label for="actualCost">Costo Actual (AC):</label>
  <input id="actualCost" type="number" bind:value={actualCost} />

  <label for="plannedValue">Valor Planificado (PV):</label>
  <input id="plannedValue" type="number" bind:value={plannedValue} />

  <button on:click={calculateEVM} class="calculate">Calcular</button>

  <!-- Display Results -->
  <p style="color: blueviolet; font-weight: bold;">
    Índice de Desempeño de Costos (CPI): {cpi}
  </p>
  <p style="color: blueviolet; font-weight: bold;">
    Índice de Desempeño de Cronograma (SPI): {spi}
  </p>
</div>

<style>
  .evm-container {
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
