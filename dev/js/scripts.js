async function FalseRequest(data, status) {
    if (status) {
        showMessage(data.text);
    } else {
        let el_error = document.querySelector('.error');
        if (el_error) {
            el_error.classList.toggle('hidden');
        } else {
            console.log(data.text);
        }
    }
}
async function setQueryForServer(params_array, action_function) {

    let params = {}
    if ('params' in params_array) params = params_array.params;
    const url = '/api/' + params_array.url;

    let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(params)
    });
      
    let result = await response.json();
    
    if (result.ok) {
        action_function(result);
    } else {
        FalseRequest(result, 'alert' in params_array);
    }

}

function showMessage(text) {
    alert(text);
}

function setDateForRow(data, header=false, inputHeaderCol=false) {
    let code = '<tr>';
    for (let row of data) {
        let val = row;
        if (!val) val = '';
        let col = val;
        if (inputHeaderCol) col = `<input type="text" value="${val}" class="only_border_bottom" placeholder="Мой ответ">`;
        (header) ? code += `<th>${col}</th>` : code += `<td>${col}</td>`;
    }
    code += '</tr>';

    let table = document.querySelector('table');
    if (header) {
        table.querySelector('thead').innerHTML = code;
    } else {
        table.querySelector('tbody').insertAdjacentHTML('beforeend', code);
    }

}
function setDataTableFromExcelRows(array) {
    if (Array.isArray(array)) {
        if (array.length >= 1) {

            let table = document.querySelector('table');
            table.querySelector('thead').textContent = '';
            table.querySelector('tbody').textContent = '';

            const header = array[0];
            setDateForRow(header, true, true);
            for (let i=1; i < array.length; i++) {
                if (i > 10) break;

                setDateForRow(array[i], false, false);
            }
        } else {
            showMessage('Слишком мало строк для распознавания прайс-листа');
        }
    } else {
        showMessage('Excel считался неверно ...');
    }
}
// Обработчик Excel файла
function readExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, {
                type: 'binary'
            });

            const sheetsNames = workbook.SheetNames;
            const firstSheet = workbook.Sheets[sheetsNames[0]];

            const xlRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            resolve(xlRows);

        };

        reader.onerror = function(err) {
            reject([]);
        };

        reader.readAsBinaryString(file);
    })
}
// Обработчик загруженных файлов
async function handleFile(uploadFile) {

    const filePickerComponent = document.querySelector('#file');

    const size = uploadFile.size;
    const formatFile = uploadFile.type;

    // Проверяем, что файл меньше 100МБ
    if (size / (1024 * 1024) > 100) {
        filePickerComponent.value = '';
        showMessage('Файле не более 100 МБ');
    } else if (formatFile != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        filePickerComponent.value = '';
        showMessage('Формат не Excel');
    } else {

        let rows = await readExcel(uploadFile);
        setDataTableFromExcelRows(rows);
    }
}

// Функция, которая реализует DRAG AND DROP
function myUploadFile() {
    // Получаем область для перетаскивания файлов
    let dropArea = document.querySelector('.drop_area');
    let inputFile = document.querySelector('#file');
    
    if (!dropArea || !inputFile) return;

    // Вешаем на него обработчики
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })
    // Функция сбрасывающая поведение по умолчанию
    function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }
    // При попадании курсора с файлом над областью и перемещении внутри области необходимо сообщить юзеру, что файл в области для загрузки
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    });
    // Если курсор покидает область или кнопка мыши отпущена, то убираем подсветку с области
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    });
    // Функция включения подсветки
    function highlight(e) {
        dropArea.classList.add('highlight');
        dropArea.querySelector('p').textContent = 'Отпустите, чтобы загрузить';
    }
    // Функция отключения подсветки
    function unhighlight(e) {
        dropArea.classList.remove('highlight');
        dropArea.querySelector('p').textContent = 'Перетащите файл или нажмите здесь';
    }

    // При отпускании файла над областью должны получить файл(ы) и вызвать для них обработчик
    dropArea.addEventListener('drop', handleDrop, false)
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFile(files[0]);
    }

    inputFile.addEventListener('change', handleChange, false);
    function handleChange(e) {
        handleFile(this.files[0]);
    } 
}

// Функция создания прайс листа
function actionSetPriceList() {
    function savePriceListName(e) {
        const name = e.target.value;
        if (!name) {
            showMessage('Имя не заполнено');
            return;
        }
        const div = e.target.closest('div');
        div.textContent = name;
    }
    function setNewPriceListName() {
        let block = document.querySelector('.panel');

        let inputNewPrice = document.querySelector('#input_new_pricelist');
        if (inputNewPrice) return;
        
        block.insertAdjacentHTML('beforeend', `
        <div class="panel_item">
            <div class="panel_item_row">
                <div class="panel_item_row__name"><input type="text" id="input_new_pricelist" class="only_border_bottom" placeholder="Введите имя прайс листа"></div>
                <div class="panel_item_row_control">
                    <div class="control control__edit hidden"></div>
                    <div class="control control__remove"></div>
                </div>
            </div>
        </div>
        `);

        inputNewPrice = document.querySelector('#input_new_pricelist');
        inputNewPrice.addEventListener('focusout', savePriceListName);
        inputNewPrice.addEventListener('keyup', (e) => {
            if (String(e.key).toLocaleLowerCase() == 'enter') {
                e.preventDefault();
                savePriceListName(e);
            }
        });
        inputNewPrice.focus();

    }
    let btn = document.querySelector('.panel_item_new');
    if (btn) btn.addEventListener('click', setNewPriceListName);
}

window.onload = async () => {
    console.log('Page Loaded ...');
    myUploadFile();

    actionSetPriceList();

}