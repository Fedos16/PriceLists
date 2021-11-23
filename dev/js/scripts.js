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

// Вспомогательные функции
function setActionTableButton() {
    function ViewChange(e) {
        e.target.id = 'view_all_changes';
        e.target.removeEventListener('click', ViewChange);
        e.target.addEventListener('click', ViewAll);

        e.target.textContent = 'Показать все строки';

        let tableRows = document.querySelectorAll('table tbody tr');
        for (let row of tableRows) {
            if (!row.querySelector('.change_row_table')) {
                row.classList.add('hidden');
            }
        }
    }
    function ViewAll(e) {
        e.target.id = 'view_only_changes';
        e.target.removeEventListener('click', ViewAll);
        e.target.addEventListener('click', ViewChange);

        e.target.textContent = 'Показать только изменения';

        let tableRows = document.querySelectorAll('table tbody tr');
        for (let row of tableRows) {
            row.classList.remove('hidden');
        }
    }
    let btnViewChange = document.querySelector('#view_only_changes');
    let btnViewAll = document.querySelector('#view_all_changes');

    if (btnViewChange) btnViewChange.addEventListener('click', ViewChange);
    if (btnViewAll) btnViewAll.addEventListener('click', ViewAll);
}

// Отображение сообщений об ошибках или уведомление
function showMessage(text) {
    alert(text);
}
// Создание строки таблицы
function setDateForRow(data, header=false, inputHeaderCol=false, changeView=false) {
    let code = '';
    let styleRow = '';
    for (let row of data) {
        let val = row;
        let addInput = '';
        if (typeof row == 'object' && row) {
            if ('name' in row) {
                val = row.name;
            } else if ('value' in row) {
                val = row.value;
                if ('oldValue' in row && changeView) {
                    let oldValue = 'нет';
                    if (row.oldValue) oldValue = row.oldValue;
                    val = `${oldValue} ➞ ${val}`;
                }
            }
            
            if (row.val) {
                addInput = `<input type="number" value="${row.val}" id="kef" class="only_border_bottom" placeholder="Мой ответ">`;
            }
            if (row.change) {
                styleRow = ` class="change_row_table"`;
            }
        }
        if (!val) val = '';
        let col = val;
        if (inputHeaderCol) col = `<input type="text" value="${val}" class="header_field ShowItemList only_border_bottom" placeholder="Мой ответ" readonly>${addInput}`;
        (header) ? code += `<th>${col}</th>` : code += `<td${styleRow}>${col}</td>`;
    }
    code = `<tr>${code}</tr>`;

    let table = document.querySelector('table');
    if (header) {
        table.querySelector('thead').innerHTML = code;
        activateShowItemList();
    } else {
        table.querySelector('tbody').insertAdjacentHTML('beforeend', code);
    }

}
// Создание таблицы
function setDataTableFromExcelRows(array, count=false, headerInput=false, changeView=false) {
    if (Array.isArray(array)) {
        if (array.length >= 1) {

            let table = document.querySelector('table');
            table.querySelector('thead').textContent = '';
            table.querySelector('tbody').textContent = '';

            const header = array[0];
            setDateForRow(header, true, headerInput);

            for (let i=1; i < array.length; i++) {
                if (count) {
                    if (i > count) break;
                }

                setDateForRow(array[i], false, false, changeView);
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
        setDataTableFromExcelRows(rows, 10, true);

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

        let arrNames = [];

        for (let file of files) {
            let name = file.name.replace('.xlsx', '');
            arrNames.push(name);
        }

        INFO_ROW.NamesPriceLists = arrNames;
        changeStatusItemPanelMain('main_uploads', 'file_matching');

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
        INFO_ROW.FILES = this.files;
        handleFile(files);
    }

    inputFile.addEventListener('change', handleChange, false);
    function handleChange(e) {
        INFO_ROW.FILES = this.files;
        handleFile(this.files);
    } 
}

// Функция скрытия или отображения области для загрузки данных
function toggleDropArea(hidden=true) {
    let dropArea = document.querySelector('.drop_area');
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

    if (arrPriceList) {
        for (let row of arrPriceList) {
            if (row.Name == name) {
                setDataForPriceListSettings(row);
                toggleDropArea(true);
                return;
            }
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
        toggleDropArea(true);
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
            let value = item.value;
            if (!value) {
                if (item.id == 'kef') {
                    arr[arr.length - 1].val = 1;
                } else {
                    arr.push(false);
                }
            } else {
                if (item.id == 'kef') {
                    arr[arr.length - 1].val = value;
                } else {
                    arr.push({name: value, val: ''});
                }
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
async function getPriceListsName(createBlock=false) {
    async function action_function(data) {
        let arr = data.priceLists;
        if (arr.length > 0) {
            INFO_ROW.PriceLists = arr;

            if (!createBlock) return;
            
            for (let row of arr) {
                let name = row.Name;
                setBlockForPriceListName(name);
            }
        }
    }
    let url = 'finddata/getPriceListsName';

    await setQueryForServer({ url, alert: true }, action_function);
}

function changeValueMainInput() {
    let value = document.querySelector('#main_price').value;
    let arrNames = INFO_ROW.NamesPriceLists;
    for (let row of arrNames) {
        if (row != value) {
            document.querySelector('#other_price').value = row;
            break;
        }
    }
}
function setTitleForTemplatesFilesInput() {
    let templateNames = document.querySelectorAll('#file_matching input');
    let templatesTitle = document.querySelectorAll('#file_templates p');
    
    for (let i=0; i < templatesTitle.length; i++) {
        templatesTitle[i].textContent = templateNames[i].value;
    }

}

// Изменение состояние пунктов левого меню на основной странице...
function changeStatusItemPanelMain(sId, nId, changeElement=true) {
    
    document.querySelector(`.${sId}`).closest('.panel_item_row').querySelector('.panel_item_row__ico').classList.replace('ico_pending', 'ico_done');
    document.querySelector(`.${sId}`).classList.add('color_succefull');

    if (changeElement) {
        document.querySelector(`.${nId}`).closest('.panel_item').classList.add('panel_item_active');
        document.querySelector(`#${nId}`).classList.remove('hidden');
        document.querySelector(`#${sId}`).classList.add('hidden');
        document.querySelector('.panel_item_active').classList.remove('panel_item_active');
    }
}

// Сохранение данных
async function downloadData(format) {
    function action_function(data) {
        window.open(`/api/savedata/download/${data.fileName}`);
    }

    let url = 'savedata/saveAndDownloadPrice';

    const data = INFO_ROW.CURRENT_PRICELIST;

    const provider = document.querySelector('#template_provider').value;

    let params = { format, data, provider };

    document.querySelector('#donwload_pricelist').disabled = true;
    await setQueryForServer({ url, params, alert: true }, action_function);
    document.querySelector('#donwload_pricelist').disabled = false;

}
// Получение поставщика и дат изменениях
async function getProviderAndDatesProvider() {
    function action_function(data) {
        INFO_ROW.Providers = data.arr;
        console.log();
    }

    let url = 'finddata/getProviderAndDatesProvider';

    await setQueryForServer({ url }, action_function);
}

async function getDataPriceListForId() {
    async function action_function(data) {
        let arr = data.arr;
        setDataTableFromExcelRows(arr, false, false, true);
        document.querySelector('.align_row_center').classList.remove('hidden');
    }
    let obj = INFO_ROW.Providers;
    let provider = document.querySelector('#provider_all').value;
    let date = document.querySelector('#date_provider').value;

    if (provider in obj) {
        let _id;
        Object.keys(obj[provider]).map(dateRow => {
            if (new Date(Number(dateRow)).toLocaleString('ru-RU') == date) _id = obj[provider][dateRow];
        });

        if (_id) {
            
            let url = 'finddata/getPriceListForId';
            let params = { _id };
            await setQueryForServer({ url, params }, action_function);

        } else {
            showMessage('Не найден ID истории изменений');
            return;
        }
    } else {
        showMessage('Не найден Поставщик в истории изменений');
        return;
    }
}

async function actionWorkspace() {
    // Вспомогательные функции
    function unDisabledCurrentBtn(e) {
        e.target.disabled = false;
    }
    function toggleDisabledBtns(status) {
        let btns = document.querySelectorAll('#processing_files button');
        if (btns.length > 0) {
            btns.forEach(item => item.disabled = status);
        }
    }
    async function getDataFiles() {

        let dataMainFile = [];
        let dataProviderFile = [];
        let status = true;
        let textError = '';

        // 1. Получаем информацияю из загруженных файлов ...
        let files = INFO_ROW.FILES;
        if (files) {
            let mainFile;
            let providerFile;

            let mainFileName = document.querySelector('#main_price').value;
            let providerFileName = document.querySelector('#other_price').value;

            for (let file of files) {
                let nameFile = file.name.replace('.xlsx', '');
                if (nameFile == mainFileName) mainFile = file;
                if (nameFile == providerFileName) providerFile = file;
            }

            if (mainFile && providerFile) {
                dataMainFile = await readExcel(mainFile);
                dataProviderFile = await readExcel(providerFile);
            } else {
                status = false;
                textError = 'Не найдены файлы';
            }
            
        } else {
            status = false;
            textError = 'Не найден массив файлов';
        }

        return { status, textError, dataMainFile, dataProviderFile }
    }
    function compareArray(arrSource, arr, numSource, numArr) {
        let returnArr = [];
        for (let row of arrSource) {
            let statusIn = false;
            for (rowArr of arr) {
                let valRow = String(row[numSource]).toLowerCase();
                let valRowArr =  String(rowArr[numArr]).toLowerCase();
                if (valRow == valRowArr) {
                    statusIn = true;
                    break;
                }
            }
            if (!statusIn) {
                returnArr.push(row);
            }
        }

        return returnArr;
    }
    async function getNumRows() {
        let numMain = -1;
        let numProvider = -1;

        let status = true;


        let nameMainPrice = document.querySelector('#template_main').value;
        let nameProviderPrice = document.querySelector('#template_provider').value;

        let nameRowMainPrice = document.querySelector('.field_main').value;
        let nameRowProviderPrice = document.querySelector('.field_provider').value;

        const arrayPriceList = INFO_ROW.PriceLists;

        for (let row of arrayPriceList) {
            if (row.Name == nameMainPrice) {
                let arr = row.Data.Header;
                if (typeof arr[0] == 'object') {
                    arr = arr.map(item => { return item.name });
                }
                numMain = arr.indexOf(nameRowMainPrice);
            }
            if (row.Name == nameProviderPrice) {
                let arr = row.Data.Header;
                if (typeof arr[0] == 'object') {
                    arr = arr.map(item => { return item.name });
                }
                numProvider = arr.indexOf(nameRowProviderPrice);
            }
        }

        console.log(` ${numMain} = ${numProvider}`)

        if (numMain == -1 || numProvider == -1) status = false;

        return { numMain, numProvider, status };
    }
    async function getNumRowForName(priceName, rowName) {

        let num = -1;

        const arrayPriceList = INFO_ROW.PriceLists;

        for (let row of arrayPriceList) {
            if (row.Name == priceName) {
                let arr = row.Data.Header;
                if (typeof arr[0] == 'object') {
                    arr = arr.map(item => { return item.name });
                }
                num = arr.indexOf(rowName);
            }
        }

        return num;
    }
    async function getExtraCharge(priceName, rowName) {
        let num = 1;

        const arrayPriceList = INFO_ROW.PriceLists;

        for (let row of arrayPriceList) {
            if (row.Name == priceName) {
                let arr = row.Data.Header;
                let source = row.Data.Header;
                if (typeof arr[0] == 'object') {
                    arr = arr.map(item => { return item.name });
                }
                let index = arr.indexOf(rowName);
                num = source[index].val;
            }
        }

        return num;
    }

    // Функции обработчики алгоритмов для кнопок
    async function compareFiles(mainArr, providerArr) {
        let nameMainPrice = document.querySelector('#template_main').value;
        let nameProviderPrice = document.querySelector('#template_provider').value;

        console.log(`Price: ${mainArr.length} - Provider: ${providerArr.length}`);

        let numPriceMain = await getNumRowForName(nameMainPrice, 'Цена');
        let numPriceProvider = await getNumRowForName(nameProviderPrice, 'Цена');

        let extraCharge = await getExtraCharge(nameProviderPrice, 'Цена');

        let { numMain, numProvider, status } = await getNumRows();

        if (!status) {
            showMessage('Ну удалось определить индексы сравниваемых полей');
            return;
        }

        let index = 0;
        for (let row of mainArr) {
            let valRow = String(row[numMain]).toLowerCase().trim();

            for (rowArr of providerArr) {
                let valRowArr = String(rowArr[numProvider]).toLowerCase().trim();
                
                if (valRow == valRowArr && index > 0) {

                    console.log(`Найдено совпадение: ${valRow}`);
                    
                    let priceProvider = Number(rowArr[numPriceProvider]) * extraCharge;
                    let oldValue = row[numPriceMain];

                    mainArr[index][numPriceMain] = { value: priceProvider, change: true, oldValue: oldValue };

                    break;
                }
            }
            index ++;
        }

        INFO_ROW.CURRENT_PRICELIST = mainArr;

        setDataTableFromExcelRows(mainArr, false, false, true);

    }
    async function dontHave(mainArr, providerArr) {

        const { numMain, numProvider, status } = await getNumRows();

        if (!status) {
            console.log(`Не определены индексы столбцов: ${numMain} = ${numProvider}`);
            return;
        }

        let arr = compareArray(providerArr, mainArr, numProvider, numMain);
        setDataTableFromExcelRows(arr);
    }
    async function noSupplier(mainArr, providerArr) {

        const { numMain, numProvider, status } = await getNumRows();

        if (!status) {
            console.log(`Не определены индексы столбцов: ${numMain} = ${numProvider}`);
            return;
        }

        let arr = compareArray(mainArr, providerArr, numMain, numProvider);
        setDataTableFromExcelRows(arr);
        
    }

    // Функции для кнопок
    function changeStatePanelItemTwo(e) {
        let mainBlock = e.target.closest('.panel_item');
        document.querySelector('.panel_item_active').classList.remove('panel_item_active');
        mainBlock.classList.add('panel_item_active');

        let blockName = mainBlock.querySelector('.panel_item_row__name');
        let classBlockName = blockName.classList;
        if (classBlockName.length > 0) {
            let name = classBlockName[1];
            let blocks = document.querySelectorAll('.content .row');
            for (let block of blocks) {
                if (block.id) block.classList.add('hidden');
            } 
            document.querySelector(`#${name}`).classList.remove('hidden');
        }

    }
    async function createPrice(e) {

        e.target.disabled = true;
        toggleDisabledBtns(true);
        let { status, textError, dataMainFile, dataProviderFile } = await getDataFiles();
        if (!status) {
            showMessage(textError);
            unDisabledCurrentBtn(e);
            return;
        }

        await compareFiles(dataMainFile, dataProviderFile);

        unDisabledCurrentBtn(e);
        toggleDisabledBtns(false);

    }
    async function createDontHave(e) {
        e.target.disabled = true;
        toggleDisabledBtns(true);
        let { status, textError, dataMainFile, dataProviderFile } = await getDataFiles();
        if (!status) {
            showMessage(textError);
            unDisabledCurrentBtn(e);
            return;
        }

        await dontHave(dataMainFile, dataProviderFile);

        unDisabledCurrentBtn(e);
        toggleDisabledBtns(false);
    }
    async function createnoSupplier(e) {
        e.target.disabled = true;
        toggleDisabledBtns(true);
        let { status, textError, dataMainFile, dataProviderFile } = await getDataFiles();
        if (!status) {
            showMessage(textError);
            unDisabledCurrentBtn(e);
            return;
        }

        await noSupplier(dataMainFile, dataProviderFile);

        unDisabledCurrentBtn(e);
        toggleDisabledBtns(false);
    }
    async function createCompareFiles(e) {
        e.target.disabled = true;
        toggleDisabledBtns(true);
        let { status, textError, dataMainFile, dataProviderFile } = await getDataFiles();
        if (!status) {
            showMessage(textError);
            unDisabledCurrentBtn(e);
            return;
        }

        await compareFiles(dataMainFile, dataProviderFile);

        unDisabledCurrentBtn(e);
        toggleDisabledBtns(false);
    }
    
    // Тело основной функции

    let elems = document.querySelectorAll('.panel_item_row');
    if (elems) {
        elems.forEach(item => item.addEventListener('click', changeStatePanelItemTwo));
    }

    // Событие нажатия кнопки создания прайса
    let btnCreatePrice = document.querySelector('#create_price');
    if (btnCreatePrice) btnCreatePrice.addEventListener('click', createPrice);

    let btnCreateCompare = document.querySelector('#create_compare');
    if (btnCreateCompare) btnCreateCompare.addEventListener('click', createCompareFiles);

    let btnCreateDontHave = document.querySelector('#create_dont_have');
    if (btnCreateDontHave) btnCreateDontHave.addEventListener('click', createDontHave);

    let btnCreateNoSupplier = document.querySelector('#create_no_supplier');
    if (btnCreateNoSupplier) btnCreateNoSupplier.addEventListener('click', createnoSupplier);
}

window.onload = async () => {

    const urlPage = window.location.pathname;

    activateShowItemList();

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
        await getPriceListsName(true);
    } else if (urlPage == '/') {
        await getPriceListsName();
        await actionWorkspace();
    } else if (urlPage == '/statistics') {
        await getProviderAndDatesProvider();
    }

    setActionTableButton();

}