//Connects to root path
const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//Peer undefined = let Peer handle its own ID
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
//temp variable to save streams that may close
const peers = []
//Grabs video and audio, is a promise
navigator.mediaDevices.getUserMedia({
    video: true, 
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    //We answer call and send them our stream
    myPeer.on('call', call => {
        call.answer(stream)

        //response to incoming stream
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userID => {
        connectToNewUser(userID, stream)
    })
})

socket.on('user-disconnected', userID => {
    //console.log(userID)
    //if there exists a userId, then close
    if (peers[userID]) peers[userID].close()
})

//As soon as Peer gives back ID, 
myPeer.on('open', ID => {
    //Speaks with front-end
    //room id, and user id
    socket.emit('join-room', ROOM_ID, ID)
})

/*
//Listens to backend when someone connects
socket.on('user-connected', userID => {
    console.log('User connected: ' + userID)
})
*/

//Joins stream to video, once stream is loaded, to play it as video
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//Gives video to other user
function connectToNewUser(userID, stream) {
    const call = myPeer.call(userID, stream)
    const video = document.createElement('video')
    //Once other user recieves, theyll send back their stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    //Whenever someone leaves
    call.on('close', () => {
        video.remove()
    })

    peers[userID] = call
}