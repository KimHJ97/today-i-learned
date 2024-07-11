const users = []

const addUser = ({ id, username, room }) => {
    // 데이터 정리 (유저이름)
    username = username.trim()
    room = room.trim()

    // 데이터 유효성 검사
    if (!username || !room) {
        return {
            error: '사용자 이름과 방이 필요합니다!'
        }
    }

    // 기존 사용자 확인
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // 사용자 이름 확인
    if (existingUser) {
        return {
            error: '사용자 이름이 사용 중입니다!'
        }
    }

    // 유저 저장
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}