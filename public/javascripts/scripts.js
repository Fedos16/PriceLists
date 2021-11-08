async function FalseRequest(e,t){if(t)showMessage(e.text);else{let t=document.querySelector(".error");t?t.classList.toggle("hidden"):console.log(e.text)}}async function setQueryForServer(e,t){let o={};"params"in e&&(o=e.params);const n="/api/"+e.url;let r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(o)}),a=await r.json();a.ok?t(a):FalseRequest(a,"alert"in e)}function showMessage(e){alert(e)}function setDateForRow(e,t=!1,o=!1){let n="<tr>";for(let r of e){let e=r;e||(e="");let a=e;o&&(a=`<input type="text" value="${e}" class="only_border_bottom" placeholder="Мой ответ">`),n+=t?`<th>${a}</th>`:`<td>${a}</td>`}n+="</tr>";let r=document.querySelector("table");t?r.querySelector("thead").innerHTML=n:r.querySelector("tbody").insertAdjacentHTML("beforeend",n)}function setDataTableFromExcelRows(e){if(Array.isArray(e))if(e.length>=1){let t=document.querySelector("table");t.querySelector("thead").textContent="",t.querySelector("tbody").textContent="",setDateForRow(e[0],!0,!0);for(let t=1;t<e.length&&!(t>10);t++)setDateForRow(e[t],!1,!1)}else showMessage("Слишком мало строк для распознавания прайс-листа");else showMessage("Excel считался неверно ...")}function readExcel(e){const t=new FileReader;t.onload=function(e){const t=e.target.result,o=XLSX.read(t,{type:"binary"}),n=o.SheetNames,r=o.Sheets[n[0]];setDataTableFromExcelRows(XLSX.utils.sheet_to_json(r,{header:1}))},t.onerror=function(e){showMessage(e)},t.readAsBinaryString(e)}function handleFile(e){const t=document.querySelector("#file"),o=e.size,n=e.type;o/1048576>100?(t.value="",showMessage("Файле не более 100 МБ")):"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"!=n?(t.value="",showMessage("Формат не Excel")):(readExcel(e),console.log("Что то делаем с файлом ..."))}function myUploadFile(){let e=document.querySelector(".drop_area"),t=document.querySelector("#file");function o(e){e.preventDefault(),e.stopPropagation()}function n(t){e.classList.add("highlight"),e.querySelector("p").textContent="Отпустите, чтобы загрузить"}function r(t){e.classList.remove("highlight"),e.querySelector("p").textContent="Перетащите файл или нажмите здесь"}e&&t&&(["dragenter","dragover","dragleave","drop"].forEach(t=>{e.addEventListener(t,o,!1)}),["dragenter","dragover"].forEach(t=>{e.addEventListener(t,n,!1)}),["dragleave","drop"].forEach(t=>{e.addEventListener(t,r,!1)}),e.addEventListener("drop",function(e){handleFile(e.dataTransfer.files[0])},!1),t.addEventListener("change",function(e){handleFile(this.files[0])},!1))}window.onload=(async()=>{console.log("Page Loaded ..."),myUploadFile()});