<script>
  let investment = 0;
  let gain = 0;
  let roi = 0;

  function calculateROI() {
    if (investment > 0) {
      roi = ((gain - investment) / investment) * 100;
    } else {
      roi = 0;
    }
  }
</script>

<div class="card">
  <h2>Retorno de Inversión (ROI)</h2>
  <p class="description">
    El ROI mide la rentabilidad de una inversión en relación con su costo.
  </p>

  <label for="investment">Inversión:</label>
  <input
    type="number"
    id="investment"
    bind:value={investment}
    placeholder="Ingrese la cantidad de inversión"
  />

  <label for="gain">Ganancia:</label>
  <input
    type="number"
    id="gain"
    bind:value={gain}
    placeholder="Ingrese la cantidad de ganancia"
  />

  <button class="calculate" on:click={calculateROI}>Calcular ROI</button>
  <p class="result">ROI: {roi.toFixed(2)}%</p>
</div>

<style>
  .card {
    max-width: 600px;
    margin: 0 auto;
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #495057;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }

  .description {
    color: #6c757d;
    font-size: 16px;
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #495057;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 16px;
  }

  button.calculate {
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

  button.calculate:hover {
    background-color: #0056b3;
  }

  .result {
    text-align: center;
    color: #495057;
    font-size: 18px;
    margin-top: 15px;
  }
</style>
