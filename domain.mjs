export const REASONS=['Sem motivo confirmado','Relatório de visita','Aprovação do cliente','Nota fiscal','Pedido de compra','Divergência de valor','Comprovante de execução','Outros'];
export const STATES=['Aberto','Em andamento','Resolvido'];
export function money(v){
 let s=String(v??'').trim().replace(/^R\$\s*/, '');
 if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
 if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('Valor inválido. Use 1.250,00 ou 1250.00.');
 const [a,b='']=s.split('.'); const n=Number(a)*100+Number(b.padEnd(2,'0'));
 if(!Number.isSafeInteger(n)||n<=0||n>100000000000)throw Error('Valor fora do limite.');return n;
}
export function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T12:00:00Z'))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)throw Error('Data inválida. Use AAAA-MM-DD.');return v;}
export function csvParse(input){
 input=input.replace(/^\uFEFF/,'');const first=input.split(/\r?\n/)[0];const sep=first.includes(';')?';':',';
 const rows=[];let row=[],field='',quote=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quote&&input[i+1]==='"'){field+='"';i++;}else if(!quote&&field.length)throw Error('CSV inválido: aspas no campo.');else quote=!quote;}
 else if(c===sep&&!quote){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&input[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}
 if(quote)throw Error('CSV inválido: aspas não fechadas.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length<2)throw Error('Inclua cabeçalho e pelo menos um título.');
 const headers=rows.shift().map(x=>x.trim().toLowerCase());const expected=['cliente','referencia','valor','vencimento'];
 if(new Set(headers).size!==headers.length||expected.some(x=>!headers.includes(x)))throw Error('Cabeçalhos obrigatórios: cliente;referencia;valor;vencimento');
 if(rows.length>1000)throw Error('Máximo de 1.000 títulos por importação.');
 return rows.map((r,i)=>{try{if(r.length!==headers.length)throw Error('Número de colunas diferente do cabeçalho.');const o=Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]));if(!o.cliente||!o.referencia||o.cliente.length>160||o.referencia.length>100)throw Error('Cliente ou referência inválidos.');return {client:o.cliente,reference:o.referencia,amount:money(o.valor),due:date(o.vencimento)};}catch(e){throw Error(`Linha ${i+2}: ${e.message}`);}});
}
export function csvEscape(value){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
