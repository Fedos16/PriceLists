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

    if (id_input == 'main_price') {
        let arr = INFO_ROW.NamesPriceLists;
        setDataForList(arr);
        showList();
    } else if (id_input == 'template_main' || id_input == 'template_provider') {

        let priceLists = INFO_ROW.PriceLists;

        let sourceArray = priceLists.map(item => { return item.Name });
        let activeValue = document.querySelector('#template_provider').value;
        if (id_input == 'template_provider') activeValue = document.querySelector('#template_main').value;

        let arr = sourceArray.filter(item => {
            if (item != activeValue) return item;
        });

        setDataForList(arr);
        showList();
    } else if (id_input == 'field_main' || id_input == 'field_provider') {
        let namePrice = document.querySelector('#template_main').value;
        if (id_input == 'field_provider') namePrice = document.querySelector('#template_provider').value;

        const arrayPriceList = INFO_ROW.PriceLists;
        let arr = [];

        for (let row of arrayPriceList) {
            if (row.Name == namePrice) {
                arr = row.Data.Header;
                if (typeof arr[0] == 'object') {
                    arr = arr.map(item => { return item.name });
                }
                break;
            }
        }

        setDataForList(arr);
        showList();

    } else if (id_input == 'header_field') {
        let arr = ['Наименование', 'Артикул', 'Бренд', 'Цена', 'Остаток', 'Свое значение'];
        let items = document.querySelectorAll('.header_field');
        if (items.length > 0) {
            for (let row of items) {
                if (arr.includes(row.value)) {
                    arr.splice(arr.indexOf(row.value), 1);
                }
            }
        }
        setDataForList(arr);
        showList(false, true);
    } else if (id_input == 'donwload_pricelist') {
        let arr = ['xlsx', 'csv'];
        setDataForList(arr);
        showList();
    } else if (id_input == 'provider_all') {
        let arr = Object.keys(INFO_ROW.Providers);
        setDataForList(arr);
        showList(true);
    } else if (id_input == 'date_provider') {
        let obj = INFO_ROW.Providers;
        let provider = document.querySelector('#provider_all').value;
        let arr = [];
        if (provider in obj) arr = Object.keys(obj[provider]);
        arr = arr.map(item => { 
            return `${new Date(Number(item)).toLocaleString('ru-RU')}`;
        });
        setDataForList(arr);
        showList(true);
    }

    let itemsList = document.querySelectorAll('.ItemList ul li');
    if (itemsList.length > 0) itemsList.forEach(item => item.addEventListener('click', slectChoice));
    let removeItem = document.querySelector('.ItemList .clear');
    if (removeItem) removeItem.addEventListener('click', clearElementValue)
}
async function slectChoice(e) {
    let elem = INFO_ROW.Element;

    let li = e.target.closest('li');
    const value = li.textContent;

    if (value == 'Ничего не найдено') return;
    document.querySelector('.ItemList').classList.add('hidden');

    elem.value = value;

    const idElem = elem.id;
    let classElem = elem.classList;
    if (classElem.length > 0) classElem = classElem[0];

    if (idElem == 'main_price') {
        changeValueMainInput();
        changeStatusItemPanelMain('file_matching', 'file_templates');
        setTitleForTemplatesFilesInput();
    } else if (idElem == 'template_main' || idElem == 'template_provider') {
        let inputs = document.querySelectorAll('#file_templates input');
        let status = true;
        for (let element of inputs) {
            if (!element.value) {
                status = false;
                break;
            }
        }
        if (status) {
            changeStatusItemPanelMain('file_templates', 'compare_rules');
        }
    } else if (classElem == 'field_main' || classElem == 'field_provider') {
        let block = elem.closest('.row');
        let inputs = block.querySelectorAll('input');
        let status = true;
        for (let element of inputs) {
            if (!element.value) {
                status = false;
                break;
            }
        }
        if (status) {
            changeStatusItemPanelMain('compare_rules', 'processing_files', false);
            document.querySelector('#create_price').disabled = false;
        }
    } else if (classElem == 'header_field') {
        if (value == 'Свое значение') {
            elem.value = '';
            elem.readOnly = false;
            elem.classList.remove('ShowItemList');
            elem.focus();
        } else {
            elem.readOnly = true;
        }

        if (value == 'Цена') {
            let newInput = document.createElement('input');
            newInput.id = 'kef';
            newInput.placeholder = 'Коэфициент';
            newInput.className = 'only_border_bottom';
            newInput.type = 'number';
            elem.after(newInput);
        } else {
            let block = elem.parentNode;
            let kef = block.querySelector('#kef');
            if (kef) kef.remove();
        }
    } else if (idElem == 'donwload_pricelist') {
        await downloadData(value);
        return;
    } else if (idElem == 'provider_all') {
        document.querySelector('#date_provider').value = '';
        clearTable();
        document.querySelector('.align_row_center').classList.add('hidden');
    } else if (idElem == 'date_provider') {
        await getDataPriceListForId();
    }
}
function clearElementValue(e) {
    let elem = INFO_ROW.Element;
    if (elem) {
        elem.value = '';
        let block = elem.parentNode;
        let kef = block.querySelector('#kef');
        if (kef) kef.remove();
    }
}

function activateShowItemList() {
    let elems = document.querySelectorAll('.ShowItemList');
    if (elems.length > 0) {
        elems.forEach(item => {
            item.removeEventListener('click', ShowItemList);
            item.addEventListener('click', ShowItemList);
        });
    }
}