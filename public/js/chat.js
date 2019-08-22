const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationMessageButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
// console.log(Qs.parse(location.search, { ignoreQueryPrefix: true }))
let { username, room, activeRoom} = Qs.parse(location.search, { ignoreQueryPrefix: true })
if(activeRoom){
    room = activeRoom
}
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOfset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOfset) {
        $messages.scrollTop = containerHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A | MMMM D')
    })


    $messages.insertAdjacentHTML('beforeend', html)

    if (message.username === username.trim().toLowerCase()) {
        $messages.lastElementChild.style.justifyContent = "flex-end"
        $messages.lastElementChild.lastElementChild.setAttribute('class', 'right-message')
    }
    
    
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a | MMMM D')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    if (message.username === username.trim().toLowerCase()) {
        $messages.lastElementChild.style.justifyContent = "flex-end"
        $messages.lastElementChild.lastElementChild.setAttribute('class', 'right-message')
    }
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $locationMessageButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!')
            $locationMessageButton.removeAttribute('disabled')
        })
    }, (failure) => {
        console.log(failure)
        $.getJSON('https://ipinfo.io/geo', (response) => {
            console.log(response)
            const loc = response.loc.split(',')
            socket.emit('sendLocation', {
                latitude: loc[0],
                longitude: loc[1]
            }, () => {
                console.log('Location shared!')
                $locationMessageButton.removeAttribute('disabled')
            })
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})