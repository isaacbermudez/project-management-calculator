<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let gain = 0;
  let cost = 0;
  let roi = 0;

  const formula = `
    ROI = \\frac{\\text{Ganancia de la Inversión} - \\text{Costo de la Inversión}}{\\text{Costo de la Inversión}} \\times 100
  `;

  function calculateROI() {
    if (cost === 0) {
      roi = "Error: División por cero";
    } else {
      roi = ((gain - cost) / cost) * 100;
    }
  }
</script>

<div class="roi-container">
  <h2>Retorno de Inversión (ROI)</h2>

  <!-- Render Formula with KaTeX -->
  <div class="formula">
    <strong>Fórmula:</strong>
    <div class="math">
      {@html katex.renderToString(formula, { throwOnError: false })}
    </div>
  </div>

  <!-- Input Fields -->
  <label for="gain">Ganancia de la inversión:</label>
  <input id="gain" type="number" bind:value={gain} />

  <label for="cost">Costo de la inversión:</label>
  <input id="cost" type="number" bind:value={cost} />

  <button on:click={calculateROI} class="calculate">Calcular</button>

  <!-- Display Result -->
  <p style="color: blueviolet; font-weight: bold; ">Retorno de Inversión (ROI): {roi}%</p>
</div>


<style>
  .roi-container {
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
