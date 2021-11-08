async function FalseRequest(data, status) {
    if (status) {
        alert(data.text);
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

// Обработчик загруженных файлов
function handleFiles(files) {
    // Предположил, на всякий случай, что файлов может быть несколько. Перебираем их в массиве
    ([...files]).forEach(uploadFile => {

        const size = uploadFile.size;
        const formatFile = uploadFile.type;

        // Проверяем, что файл меньше 100МБ
        if (size / (1024 * 1024) > 100) {
            filePickerComponent.value = '';
            alert('Файле не более 100 МБ');
        } else if (formatFile != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            filePickerComponent.value = '';
            alert('Файле не более 100 МБ');
        } else {
            console.log('Что то делаем с файлом ...');
        }
    })
}

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
    }
    // Функция отключения подсветки
    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // При отпускании файла над областью должны получить файл(ы) и вызвать для них обработчик
    dropArea.addEventListener('drop', handleDrop, false)
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    }

    inputFile.addEventListener('change', handleChange, false);
    function handleChange(e) {
        handleFiles(this.files);
    } 
}

window.onload = async () => {
    console.log('Page Loaded ...');
    myUploadFile();
}