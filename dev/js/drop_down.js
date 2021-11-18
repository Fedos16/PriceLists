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
                break;
            }
        }

        setDataForList(arr);
        showList();

    }

    let itemsList = document.querySelectorAll('.ItemList ul li');
    if (itemsList.length > 0) itemsList.forEach(item => item.addEventListener('click', slectChoice));
}
function slectChoice(e) {
    let elem = INFO_ROW.Element;

    let li = e.target.closest('li');

    elem.value = li.textContent;
    document.querySelector('.ItemList').classList.add('hidden');

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
    }
}

let elems = document.querySelectorAll('.ShowItemList');
if (elems.length > 0) {
    elems.forEach(item => {
        item.removeEventListener('click', ShowItemList);
        item.addEventListener('click', ShowItemList);
    });
}