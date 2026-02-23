document.addEventListener('DOMContentLoaded', () => {
  const tabs = {
    classes: document.getElementById('tab-classes'),
    properties: document.getElementById('tab-properties'),
    individuals: document.getElementById('tab-individuals'),
    cqs: document.getElementById('tab-cqs')
  };

  const sections = {
    classes: document.getElementById('sec-classes'),
    properties: document.getElementById('sec-properties'),
    individuals: document.getElementById('sec-individuals'),
    cqs: document.getElementById('sec-cqs')
  };

  function activateTab(key) {
    Object.values(sections).forEach(s => {
      if(s) s.classList.add('hidden');
    });
    if (sections[key]) sections[key].classList.remove('hidden');

    Object.keys(tabs).forEach(k => {
      const btn = tabs[k];
      if (!btn) return;
      if (k === key) btn.classList.add('bg-gray-800'); 
      else btn.classList.remove('bg-gray-800');
    });
  }

  Object.keys(tabs).forEach(k => {
    const btn = tabs[k];
    if (btn) btn.addEventListener('click', () => activateTab(k));
  });

  activateTab('classes');

  const endpoint = 'http://localhost:3030/waste_db/query';
  const prefixes = 'PREFIX : <http://www.semanticweb.org/asus/ontologies/2026/1/untitled-ontology-4#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';

  function cleanURI(uri) {
    if (!uri) return '';
    try { return String(uri).split('#').pop(); } catch (e) { return String(uri); }
  }

  async function executeSPARQL(query) {
    const url = `${endpoint}?query=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: { Accept: 'application/sparql-results+json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return (json && json.results && json.results.bindings) ? json.results.bindings : [];
  }

  const querySelect = document.getElementById('querySelect');
  const searchBtn = document.getElementById('searchBtn');
  const operationalSelect = document.getElementById('operationalSelect');
  const runOpBtn = document.getElementById('runOpBtn');
  const tableHeaders = document.getElementById('tableHeaders');
  const resultsBody = document.getElementById('resultsBody');

  async function fetchClasses() {
    const q = `${prefixes}\nSELECT ?class ?parent WHERE { ?class a owl:Class . OPTIONAL { ?class rdfs:subClassOf ?parent . FILTER(!isBlank(?parent)) } FILTER(!isBlank(?class)) }`;
    try {
      const bindings = await executeSPARQL(q);
      const container = document.getElementById('classesHierarchy');
      if (!container) return;

      const groups = {};
      const TOP = 'Top Level Concepts';
      for (const b of bindings) {
        const className = b.class ? cleanURI(b.class.value) : '';
        const parentName = b.parent ? cleanURI(b.parent.value) : TOP;
        if (!groups[parentName]) groups[parentName] = [];
        groups[parentName].push(className);
      }

      container.innerHTML = '';
      for (const parent of Object.keys(groups)) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm p-5 border border-gray-200';
        
        const header = document.createElement('div');
        header.className = 'text-lg font-bold text-gray-800 mb-3 border-b pb-2';
        header.textContent = parent;
        card.appendChild(header);

        const childWrap = document.createElement('div');
        childWrap.className = 'flex flex-wrap gap-2 mt-3';
        for (const child of groups[parent]) {
          const pill = document.createElement('span');
          pill.className = 'bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200';
          pill.textContent = child;
          childWrap.appendChild(pill);
        }
        card.appendChild(childWrap);
        container.appendChild(card);
      }
    } catch (err) { console.error(err); }
  }

  async function fetchProperties() {
    const q = `${prefixes}\nSELECT ?prop ?type ?domain ?range WHERE { { ?prop a owl:ObjectProperty . BIND('Object' AS ?type) } UNION { ?prop a owl:DatatypeProperty . BIND('Data' AS ?type) } OPTIONAL { ?prop rdfs:domain ?domain } OPTIONAL { ?prop rdfs:range ?range } FILTER(!isBlank(?prop)) }`;
    try {
      const bindings = await executeSPARQL(q);
      const tbody = document.querySelector('#propertiesTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      for (const b of bindings) {
        const tr = document.createElement('tr');
        const type = b.type ? b.type.value : '';
        const badgeClass = type === 'Object' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
        
        tr.innerHTML = `
          <td class="p-4 border-b font-semibold">${b.prop ? cleanURI(b.prop.value) : ''}</td>
          <td class="p-4 border-b"><span class="px-2 py-1 rounded text-xs font-bold ${badgeClass}">${type}</span></td>
          <td class="p-4 border-b text-gray-600">${b.domain ? cleanURI(b.domain.value) : 'Any'}</td>
          <td class="p-4 border-b text-gray-600">${b.range ? cleanURI(b.range.value) : 'Any'}</td>
        `;
        tbody.appendChild(tr);
      }
    } catch (err) { console.error(err); }
  }

  async function fetchIndividuals() {
    const q = `${prefixes}\nSELECT ?ind ?class WHERE { ?ind rdf:type ?class . FILTER(?class != <http://www.w3.org/2002/07/owl#NamedIndividual> && ?class != owl:Class && ?class != owl:ObjectProperty && ?class != owl:DatatypeProperty && ?class != owl:Ontology) }`;
    try {
      const bindings = await executeSPARQL(q);
      const tbody = document.querySelector('#individualsTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      for (const b of bindings) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="p-4 border-b font-bold text-gray-900">${b.ind ? cleanURI(b.ind.value) : ''}</td>
          <td class="p-4 border-b"><span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${b.class ? cleanURI(b.class.value) : ''}</span></td>
        `;
        tbody.appendChild(tr);
      }
    } catch (err) { console.error(err); }
  }

  function buildTableHeaders(columns) {
    tableHeaders.innerHTML = '';
    for (const c of columns) {
      const th = document.createElement('th');
      th.className = 'p-4 text-left font-medium text-gray-600';
      th.textContent = c;
      tableHeaders.appendChild(th);
    }
  }

  function renderBindingsToTable(bindings, columns) {
    resultsBody.innerHTML = '';
    if (!bindings.length) {
      resultsBody.innerHTML = `<tr><td colspan="${columns.length}" class="p-4 text-center text-gray-500">No data matched the query.</td></tr>`;
      return;
    }
    for (const b of bindings) {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';
      for (const v of Object.keys(b)) {
        const td = document.createElement('td');
        td.className = 'p-4 border-b text-gray-800';
        let raw = b[v] ? b[v].value : '';
        
        if (v.toLowerCase().includes('fill')) {
            let num = parseInt(raw.split('^^')[0]);
            td.innerHTML = num > 75 ? `<span class="text-red-600 font-bold">${num}% (Warning)</span>` : `${num}%`;
        } else if (v.toLowerCase().includes('cap')) {
            td.textContent = parseInt(raw.split('^^')[0]).toLocaleString();
        } else {
            td.textContent = cleanURI(raw);
        }
        tr.appendChild(td);
      }
      resultsBody.appendChild(tr);
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const opt = querySelect.value;
      let columns = [], q = '';
      if (opt === 'cq1') {
        columns = ['Waste Type', 'Fill Level (%)'];
        q = `${prefixes}\nSELECT ?waste ?fill WHERE { :Bin_001 :containsWaste ?waste . :Bin_001 :currentFillLevel ?fill . }`;
      } else if (opt === 'cq2') {
        columns = ['Processing Facility', 'Assigned Route'];
        q = `${prefixes}\nSELECT ?facility ?route WHERE { :Truck_A :deliversTo ?facility . :Truck_A :followsRoute ?route . }`;
      } else if (opt === 'cq3') {
        columns = ['Collection Truck', 'Max Capacity'];
        q = `${prefixes}\nSELECT ?truck ?cap WHERE { ?truck :followsRoute :Route_1A . ?truck :vehicleCapacity ?cap . }`;
      }
      
      resultsBody.innerHTML = `<tr><td colspan="2" class="p-4 text-gray-500">Loading...</td></tr>`;
      buildTableHeaders(columns);
      const data = await executeSPARQL(q);
      renderBindingsToTable(data, columns);
    });
  }

  if (runOpBtn) {
    runOpBtn.addEventListener('click', async () => {
      const opt = operationalSelect.value;
      let columns = [], q = '';
      if (opt === 'op1') {
        columns = ['Bin ID', 'Current Fill Level (%)'];
        q = `${prefixes}\nSELECT ?bin ?fill WHERE { ?bin :currentFillLevel ?fill . FILTER(?fill > 75) }`;
      } else if (opt === 'op2') {
        columns = ['Truck ID', 'Capacity'];
        q = `${prefixes}\nSELECT ?truck ?cap WHERE { ?truck :vehicleCapacity ?cap . FILTER(?cap >= 5000) }`;
      }
      
      resultsBody.innerHTML = `<tr><td colspan="2" class="p-4 text-gray-500">Loading...</td></tr>`;
      buildTableHeaders(columns);
      const data = await executeSPARQL(q);
      renderBindingsToTable(data, columns);
    });
  }

  fetchClasses();
  fetchProperties();
  fetchIndividuals();
});