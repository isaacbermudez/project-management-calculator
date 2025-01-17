<script>
	import ROI from './components/ROI.svelte';
	import PaybackPeriod from './components/PaybackPeriod.svelte';
	import EVM from './components/EVM.svelte';
  
	let activeTab = 'ROI'; // Default tab
  </script>
  
  <!-- Navigation Tabs -->
  <nav class="tabs">
	<button
	  class={`tab-button ${activeTab === 'ROI' ? 'active' : ''}`}
	  on:click={() => (activeTab = 'ROI')}
	>
	  ROI
	</button>
	<button
	  class={`tab-button ${activeTab === 'Payback Period' ? 'active' : ''}`}
	  on:click={() => (activeTab = 'Payback Period')}
	>
	  Payback Period
	</button>
	<button
	  class={`tab-button ${activeTab === 'EVM' ? 'active' : ''}`}
	  on:click={() => (activeTab = 'EVM')}
	>
	  EVM
	</button>
  </nav>
  
  <!-- Dynamic Content -->
  <main class="content">
	{#if activeTab === 'ROI'}
	  <ROI />
	{:else if activeTab === 'Payback Period'}
	  <PaybackPeriod />
	{:else if activeTab === 'EVM'}
	  <EVM />
	{/if}
  </main>
  
  <style>
	/* General Styles */
	body {
	  font-family: 'Arial', sans-serif;
	  background-color: #f8f9fa;
	  margin: 0;
	  padding: 0;
	}
  
	.tabs {
	  display: flex;
	  justify-content: center;
	  gap: 10px;
	  background-color: #ffffff;
	  padding: 10px 20px;
	  border-radius: 10px;
	  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
	  margin: 20px auto;
	  max-width: 600px;
	}
  
	.tab-button {
	  flex: 1;
	  background-color: #e9ecef;
	  color: #495057;
	  border: none;
	  padding: 10px 20px;
	  border-radius: 8px;
	  font-weight: bold;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
  
	.tab-button:hover {
	  background-color: #dee2e6;
	}
  
	.tab-button.active {
	  background-color: #007bff;
	  color: #ffffff;
	  box-shadow: 0px 4px 6px rgba(0, 123, 255, 0.3);
	}
  
	.content {
	  max-width: 600px;
	  margin: 20px auto;
	  background-color: #ffffff;
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
  
	p {
	  color: #6c757d;
	  font-size: 16px;
	  margin-bottom: 10px;
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
  </style>
  