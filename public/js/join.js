const socket = io()

const $selectOptions = document.querySelector('#select-options')
const selectOptionTemplate = document.querySelector('#select-option-template').innerHTML

socket.on('activeRooms', (rooms) => {
    console.log(rooms)
    if(rooms.length > 0) {
        const html = Mustache.render(selectOptionTemplate, {rooms})
        $selectOptions.innerHTML = html
    } else{
        const html = Mustache.render('<label>There is no active rooms</label> <label>Create a brand new room</label>')
        $selectOptions.innerHTML = html
    }
    const $select = document.querySelector('#active-room')
    const $roomInput = document.querySelector('#room-input')
    console.log($select)
    if ($select) {
        $select.addEventListener('change', () => {
            console.log($select.options[$select.selectedIndex].value)
            if ($select.options[$select.selectedIndex].value) {
                $roomInput.setAttribute('disabled', 'disabled')
            } else {
                $roomInput.removeAttribute('disabled')
            }
        })
    }
    
})






