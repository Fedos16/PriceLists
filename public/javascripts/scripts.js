// Отображение выпадающего списка
async function ShowItemList(e) {
    function showList(search=false, delete_status=false, ignor_td=false) {
        let width = e.target.offsetWidth;

        INFO_ROW.Element = e.target;

        if (document.querySelector('.ItemList input')) document.querySelector('.ItemList input').remove();
        if (document.querySelector('.ItemList .clear')) document.querySelector('.ItemList .clear').remove();
        if (search) document.querySelector('.ItemList ul').insertAdjacentHTML('beforebegin', `<input type="text" placeholder="Поиск ...">`);

        if (delete_status) {
            let el_ul = document.querySelector('.ItemList ul');
            el_ul.insertAdjacentHTML('afterend', '<p class="clear">Очистить</p>');
        }

        document.querySelector('.ItemList').classList.remove('hidden');
    }
    function setDataForList(arr, multy=false) {

        let el_ul = document.querySelector('.ItemList ul');
        el_ul.textContent = '';

        console.log(INFO_ROW.Arr);

        let ids = [];
        let val = document.querySelector('#val');
        if (val) val = val.value;
        if (INFO_ROW.Arr && val) {
            if (val in INFO_ROW.Arr) {
                if (id_input in INFO_ROW.Arr[val]) ids = INFO_ROW.Arr[val][id_input];
            }
        }

        for (let row of arr) {
            if (multy) {

                let clas_row = '';
                let clas_check = '';

                if (ids.indexOf(row) != -1) {
                    clas_row = 'trueRow';
                    clas_check = 'trueCheck';
                }

                (row != 'Все объекты' && row != 'Нет героя') ?
                el_ul.insertAdjacentHTML('beforeend', `<li class="${clas_row}"><div class="flex-row content-start"><div class="block-check-box">
                <span class="check-box ${clas_check}"></span></div><div>${row}</div></div></li>`) :
                el_ul.insertAdjacentHTML('beforeend', `<li>${row}</li>`);
            } else {
                el_ul.insertAdjacentHTML('beforeend', `<li>${row}</li>`);
            }
        }
        if (arr.length == 0) {
            el_ul.innerHTML = '<li>Ничего не найдено</li>';
        }
    }

    let top = e.target.getBoundingClientRect().top
    let left = e.target.getBoundingClientRect().left;
    let height = e.target.getBoundingClientRect().height;
    let width = e.target.getBoundingClientRect().width;

    let id_input = e.target.id;
    if (!id_input) {
        let clas_item = e.target.classList;
        if (clas_item.length > 0) {
            id_input = clas_item[0];
        }
    }

    let el_list = document.querySelector('.ItemList');
    el_list.style.top = `${top + height}px`;
    el_list.style.left = `${left}px`;
    el_list.style.width = `${width}px`;

    let arr = ['Строка 1', 'Строка 2'];
    setDataForList(arr);
    showList();

    let itemsList = document.querySelectorAll('.ItemList ul li');
    if (itemsList.length > 0) itemsList.forEach(item => item.addEventListener('click', slectChoice));
}
function slectChoice(e) {
    let elem = INFO_ROW.Element;

    let li = e.target.closest('li');

    elem.value = li.textContent;
    document.querySelector('.ItemList').classList.add('hidden');
}

let elems = document.querySelectorAll('.ShowItemList');
if (elems.length > 0) {
    elems.forEach(item => {
        item.removeEventListener('click', ShowItemList);
        item.addEventListener('click', ShowItemList);
    });
}
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

const INFO_ROW = {};

// Отображение сообщений об ошибках или уведомление
function showMessage(text) {
    alert(text);
}
// Создание строки таблицы
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
// Создание таблицы
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
async function readExcel(file) {
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

async function actionSettings(uploadFile) {

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

        toggleDropArea(true);
        toggleAdditionalElemenstForSettings(false);
    }
}
// Обработчик загруженных файлов
async function handleFile(files) {
    const filePickerComponent = document.querySelector('#file');

    let typeUploads = 'Main';
    if (document.querySelector('#settings_uploads')) typeUploads = 'Settings';

    if (typeUploads == 'Settings') {
        if (files.length != 1) {
            showMessage('Загрузите только 1 файл');
            filePickerComponent.value = '';
            return;
        }

        await actionSettings(files[0]);
        return;
    }

    if (typeUploads == 'Main') {
        if (files.length != 2) {
            showMessage('Вы должны закгрузить 2 файла\n1. Ваш прайс\n2. Прайс поставщика');
            filePickerComponent.value = '';
            return;
        }

        console.log('Обработчика еще не существует ...');

        return;
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
        dropArea.querySelector('p').textContent = 'Перетащите файл или нажмите кнопку';
    }

    // При отпускании файла над областью должны получить файл(ы) и вызвать для них обработчик
    dropArea.addEventListener('drop', handleDrop, false)
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFile(files);
    }

    inputFile.addEventListener('change', handleChange, false);
    function handleChange(e) {
        handleFile(this.files);
    } 
}

// Функция скрытия или отображения области для загрузки данных
function toggleDropArea(hidden=true) {
    const dropArea = document.querySelector('.drop_area');
    if (dropArea) {
        if (hidden) {
            dropArea.classList.add('hidden');
            dropArea.querySelector('input').value = '';
        } else {
            dropArea.classList.remove('hidden');
        }
    }
}
function clearTable(idTable=false) {
    let table;

    (idTable) ? table = document.querySelector(`#${idTable}`) : table = document.querySelector('.data_table');

    table.querySelector('thead').textContent = '';
    table.querySelector('tbody').textContent = '';
}
function toggleAdditionalElemenstForSettings(hidden=true) {
    let rowRules = document.querySelector('.rules_row');
    let rowActions = document.querySelector('.actions_row');

    if (hidden) {
        if (rowRules) rowRules.classList.add('hidden');
        if (rowActions) rowActions.classList.add('hidden');
    } else {
        if (rowRules) rowRules.classList.remove('hidden');
        if (rowActions) rowActions.classList.remove('hidden');
    }
}

// Функция отображения и записи данных о прайс листе в таблицу
function setDataForPriceListSettings(data) {
    document.querySelector('.rules_row').classList.remove('hidden');
    document.querySelector('.actions_row').classList.remove('hidden');

    let header = data.Data.Header;
    let body = data.Data.Data;

    clearTable();
    
    setDateForRow(header, true, true);
    for (let row of body) {
        setDateForRow(row)
    }

}
// Изменение активного прайса в списке
function changeStatePanelItem(e) {
    let itemsList = document.querySelectorAll('.panel_item_active');
    if (itemsList.length > 0) itemsList.forEach(item => item.classList.remove('panel_item_active'));

    e.target.closest('.panel_item').classList.add('panel_item_active');

    const name = e.target.textContent;

    const arrPriceList = INFO_ROW.PriceLists;

    for (let row of arrPriceList) {
        if (row.Name == name) {
            setDataForPriceListSettings(row);
            toggleDropArea(true);
            return;
        }
    }
    
    toggleDropArea(false);
}
function setEventForItemsPriceList() {
    let items = document.querySelectorAll('.panel_item_row__name');
    if (items.length > 0) {
        items.forEach(item => {
            item.removeEventListener('click', changeStatePanelItem);
            item.addEventListener('click', changeStatePanelItem);
        })
    }
}
async function removePriceListSettings(e) {
    function action_function() {
        console.log('Прайс лист удален ...');
    }
    let url = 'savedata/removePriceList';
    let name = e.target.closest('.panel_item_row').querySelector('.panel_item_row__name').textContent;
    await setQueryForServer({ url, params: { name } }, action_function);
}
// Создаем новый блок в списке прайсов
function setBlockForPriceListName(name=false) {
    // Функция удаления прайса из списка по кнопку
    async function removePriceList(e) {
        await removePriceListSettings(e);
        e.target.closest('.panel_item').remove();
        toggleDropArea(true);
        clearTable();
        toggleAdditionalElemenstForSettings(true);

    }
    let block = document.querySelector('.panel');

    let blockName = name;
    if (!name) blockName = '<input type="text" id="input_new_pricelist" class="only_border_bottom" placeholder="Введите имя прайс листа">';

    block.insertAdjacentHTML('beforeend', `
        <div class="panel_item">
            <div class="panel_item_row">
                <div class="panel_item_row__name">${blockName}</div>
                <div class="panel_item_row_control">
                    <div class="control control__edit hidden"></div>
                    <div class="control control__remove"></div>
                </div>
            </div>
        </div>
    `);

    let controlsRemove = document.querySelectorAll('.control__remove');
    if (controlsRemove.length > 0) {
        controlsRemove.forEach(item => item.removeEventListener('click', removePriceList));
        controlsRemove.forEach(item => item.addEventListener('click', removePriceList));
    }

    setEventForItemsPriceList();
}
// Функция создания прайс листа
function actionSetPriceList() {
    function savePriceListName(e) {
        const name = e.target.value;
        if (!name) {
            return;
        }
        const div = e.target.closest('div');
        div.textContent = name;
        const panelItem = div.closest('.panel_item');

        if (panelItem) {
            let itemsList = document.querySelectorAll('.panel_item_active');
            if (itemsList.length > 0) itemsList.forEach(item => item.classList.remove('panel_item_active'));
            panelItem.classList.add('panel_item_active');
            
            setEventForItemsPriceList();
        }

        toggleDropArea(false);
    }
    function setNewPriceListName() {
        

        let inputNewPrice = document.querySelector('#input_new_pricelist');
        if (inputNewPrice) return;
        
        setBlockForPriceListName();

        inputNewPrice = document.querySelector('#input_new_pricelist');
        inputNewPrice.addEventListener('focusout', savePriceListName);
        inputNewPrice.addEventListener('keyup', (e) => {
            if (String(e.key).toLocaleLowerCase() == 'enter') {
                e.preventDefault();
                savePriceListName(e);
            }
        });
        inputNewPrice.focus();

        toggleAdditionalElemenstForSettings(true);
        clearTable();

    }
    let btn = document.querySelector('.panel_item_new');
    if (btn) btn.addEventListener('click', setNewPriceListName);
}

// Сохранение настроек прайса
async function saveSettingsPriceList() {
    function getHeaderFileds() {
        let headInputs = document.querySelectorAll('table thead input');
        let arr = [];
        headInputs.forEach(item => {
            if (!item.value) {
                arr.push(false);
            } else {
                arr.push(item.value);
            }
        });

        return arr;
    }
    function getDataTableRows() {
        let arr = [];
        let rows = document.querySelectorAll('table tbody tr');
        for (let row of rows) {
            arr.push([]);
            let cols = row.querySelectorAll('td');
            cols.forEach(item => arr[arr.length - 1].push(item.textContent));
        }

        return arr;
    }
    function action_function() {
        showMessage('Сохранено');
    }

    let namesHeader = getHeaderFileds();
    let dataRows = getDataTableRows();
    let namePriceList = document.querySelector('.panel_item_active .panel_item_row__name').textContent;
    let rules = {};

    if (!namePriceList) {
        showMessage('Не задано имя прайс листа');
        return;
    }
    if (namesHeader.includes(false)) {
        showMessage('Поле заголовка таблицы не заполнено');
        return;
    }

    let url = 'savedata/setNewPriceList';
    let params = { namesHeader, dataRows, namePriceList, rules };

    await setQueryForServer({ url, params }, action_function)

}
// Получение списка прайсов
async function getPriceListsName() {
    async function action_function(data) {
        let arr = data.priceLists;
        if (arr.length > 0) {
            INFO_ROW.PriceLists = arr;
            for (let row of arr) {
                let name = row.Name;
                setBlockForPriceListName(name);
            }
        }
    }
    let url = 'finddata/getPriceListsName';

    await setQueryForServer({ url, alert: true }, action_function);
}

window.onload = async () => {

    const urlPage = window.location.pathname;

    myUploadFile();

    actionSetPriceList();

    document.querySelector('body').addEventListener('mouseup', (e) => {
        if (e.which != 1) return;

        let containers = ['.ItemList']

        for (let i = 0; i < containers.length; i++) {
            let container = document.querySelector(containers[i]);
            if (container) {
                if (!e.target.closest(containers[i])) {
                    container.classList.add('hidden');
                }
            }
        }
    });

    const btnSaveSetting = document.querySelector('#settings_save');
    if (btnSaveSetting) btnSaveSetting.addEventListener('click', saveSettingsPriceList);

    if (urlPage == '/settings') {
        await getPriceListsName();
    }

}