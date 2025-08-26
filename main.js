const variables = [];

function insertarValor(v, j) {
    const td = document.createElement('td');
    td.className = 'text-center';
    td.innerText = (v) ?'V':'F';
    document.getElementById(j).appendChild(td);
}

function header(n, c='', p=80, t = 0, l=1, d='', f='') {
    const th = document.createElement('th');
    th.className = 'text-center text-nowrap';
    th.textContent = d+String.fromCharCode(p);
    for (let i = 1; i < n; th.textContent+=c+String.fromCharCode(p + t + i++ * l));
    if (f) th.textContent+=f;
    document.querySelector('#thead').appendChild(th);
}

function definirValores(n) {
    const m = 2 ** n;
    for (let i = 0; i < n; i++) {
        variables[i] = [];  
        header(1, '',80+i);  
        for (let j = 0, cont = 0, v = true; j < m; j++, cont++) {
            if (cont === m / 2 ** (i+1)) {    
                cont = 0;
                v = !v;
            }
            variables[i][j] = v;
            if (i === 0) {
                const tr = document.createElement('tr');
                tr.id = j;
                document.querySelector('tbody').appendChild(tr);
            }
            insertarValor(v, j);
        }
    }
}

function negacion(v, n, c, j) {
    if (j == 0)
        header(n, c, 80, 0, 1, '-(', ')');
    insertarValor(!v, j);
}

function conjuncion(n) {
    header(n, '∧');
    for (let j = 0, v = []; j < 2**n; j++) {
        v[j] = true;
        for (let i = 0; i < n; v[j] = variables[i][j] && v[j], i++); 
        insertarValor(v[j], j);
        negacion(v[j], n, '∧', j);
    }
}

function disyuncion(n) {
    header(n, ' v ');
    for (let j = 0, v = []; j < 2**n; j++) {
        v[j] = false;
        for (let i = 0; i < n; v[j] = variables[i][j] || v[j], i++); 
        insertarValor(v[j], j);
        negacion(v[j], n, ' v ', j);
    }
}

function disyuncionExclusiva(n) {
    header(n, ' Δ ');
    for (let j = 0, v = []; j < 2**n; j++) {
        v[j] = true;
        for (let i = 0; i < n; v[j] = (variables[i][j] || v[j]) && !(v[j] && variables[i][j]), i++); 
        insertarValor(!v[j], j);
        negacion(!v[j], n, ' Δ ', j);
    }
}

function condicional(n) {
    const r = [];
    for (let i = 0, v = 0, t = 0; i < (n * (n-1) / 2)*2; i++, t++) {
        r[i] = [];
        if (t - (n%2) === parseInt((2**n)/n)) {
            v++;
            t = 0;
        }
        if (t === v) 
            t++;
        header(2, '-->', 80 + v, t-v, 0);
        for (let j = 0; j < 2**n; j++) {
                r[i][j] =  (!variables[v][j] || variables[t][j]);
                insertarValor(r[i][j], j);
        }
    }
    if (n > 2) {
        header(n, '-->', 79+n, 0, -1, '(der) ');
        for (let j = 0; j < 2**n; j++) 
            insertarValor((n === 4) ? r[2][j] || r[5][j] || r[8][j]: r[1][j] || r[3][j], j);
        header(n, '-->', 80, 0, 1, '(izq) ');
        for (let j = 0, v = []; j < 2**n; j++) {
            v[j] = true;
            for (let i = 0; i < n; v[j] = (variables[i][j] || !v[j]), i++); 
            insertarValor(v[j], j);
        }
    } 
}

function bicondicional(n, opc=1) {      
    const r = [];
    for (let i = 0, v = 0, t = 0; i < (n * (n-1) / 2)*2; i++, t++) {
        r[i] = [];
        if (t - (n%2) === parseInt((2**n)/n)) {
            v++;
            t = 0;
        }
        if (t === v) 
            t++;
        if (v > t && (opc === 1 || opc === 3))
            continue;
        if (v < t && (opc === 2 || opc === 4))
            continue;
        (opc === 3 || opc === 4)?header(2,'<--> -', 80 + v, t-v, 0,'-'):header(2, '<-->', 80 + v, t-v, 0);
        for (let j = 0; j < 2**n; j++) {
            r[i][j] =  (variables[v][j] || !variables[t][j]) && (variables[t][j] || !variables[v][j]);
            insertarValor(r[i][j], j);
        }
    }
    if (n > 2) {
        (opc === 1)?header(n, '<-->', 80, 0, 1):header(n, '<-->', 79+n, 0, -1);
        for (let v= [], j = 0; j < 2**n; j++) {
            v[j] = true;
            for(let i = 0; i < n-1; v[j]=v[j]&&(variables[i][j] || !variables[i+1][j]) && (variables[i+1][j] || !variables[i][j]), i++);
            insertarValor(v[j], j);
        }
    } 
}

const operaciones = {
    conj: conjuncion,
    disy: disyuncion,
    disyEx: disyuncionExclusiva,
    cond: condicional,
    bicond: bicondicional,
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const operacion = document.querySelector('#operaciones').value;
        const n = parseInt(document.querySelector('#variables').value);
        const variante = parseInt(document.querySelector('#variantes').value);

        if (operacion !== '0' && (n > 0 && n < 5) && variante !== '0') {
            document.querySelector('table').innerHTML = `<thead><tr id='thead'></tr><thead/><tbody></tbody>`;
            definirValores(n);  
            operaciones[operacion](n, variante);
        }
        else {
            alert('Seleccione una operación y una cantidad de variables.');
        }
    });

    document.querySelector('#operaciones').addEventListener('change', (e) => {
        if (e.target.value === 'bicond') {
            document.querySelector('#vari-cont').hidden = false;
         }
         else {
            document.querySelector('#vari-cont').hidden = true;
         }
    })
});