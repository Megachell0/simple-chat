window.VUE_DEVTOOLS_CONFIG = {
    openInEditorHost: 'http://localhost:9000/'
}

alertify.set('notifier', 'position', 'top-right');




Vue.component("modal", {
    template: "#modal-template"
});

const api_axios = axios.create({
    baseURL: 'https://simple-chat-api-test.herokuapp.com/api/',
    timeout: 3000,
});

var app = new Vue({
    el: '#app',
    methods: {
        select_room: function (room) {
            this.selected_room = room
            this.update_messages()
        },

        update_messages: function () {
            api_axios.get(`messages-by-room/${app.selected_room.id}/ `, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    app.messages = response.data
                })
                .catch(error => {
                    console.log(error);
                });
        },

        update_rooms: function () {
            api_axios.get("chatrooms/", {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {

                    sorted_rooms = response.data.sort(function (a, b) {
                        var nameA = a.title.toLowerCase(), nameB = b.title.toLowerCase()
                        if (nameA < nameB)
                            return -1
                        if (nameA > nameB)
                            return 1
                        return 0
                    })


                    app.rooms_list = sorted_rooms
                    if (!app.selected_room) {
                        app.selected_room = sorted_rooms[0]
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        },

        delete_message: function (message) {
            id = message.id
            api_axios.delete(`messages/${id}/`, {
                data: {
                    id: id,
                },
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    app.update_messages()
                })
                .catch(error => {
                    alertify.error("Неполадки на сервере, пожалуйста подождите", 5);
                });

        },

        delete_room: function (room) {
            id = room.id
            api_axios.delete(`chatrooms/${id}/`, {
                data: {
                    id: id,
                },
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    app.update_rooms()
                })
                .catch(error => {
                    alertify.error("Неполадки на сервере, пожалуйста подождите", 5);
                });

        },

        send_message: function () {
            field = document.getElementById("message-input")
            user_message = field.value

            api_axios.post("messages/", {
                content: user_message,
                //user: user,
                chat_room: this.selected_room.id,
            }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    field.value = ''
                    app.update_messages()
                    app.update_rooms()
                })
                .catch(error => {
                    if (error.response.status == 400) {
                        alertify.error("Нельзя отправить пустое сообщение", 5);
                    } else {
                        alertify.error("Неполадки на сервере, пожалуйста подождите", 5);
                    }
                });
        },

        login: function () {
            login = document.getElementById("login-login").value
            pass = document.getElementById("login-password").value

            api_axios.post("auth/login/", {
                username: login,
                password: pass,
            })
                .then(response => {
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);
                    app.authenticated = true
                    app.get_user_data()
                    app.update_rooms()

                })
                .catch(error => {
                    if (error.response.status == 400 | error.response.status == 401) {
                        alertify.error("Не правильные имя пользователя или пароль", 5);
                    } else {
                        data = error.response.data;
                        console.log(Object.keys(data));
                        for (field of Object.keys(data)) {
                            for (warning of data[field]) {
                                alertify.error(field + warning, 5);
                            }
                        }
                    }
                });

        },

        logout: function () {
            api_axios.post("auth/logout/", {
                refresh_token: localStorage.getItem('refresh_token')
            }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    app.authenticated = false
                    app.rooms_list = []
                    app.selected_room = []
                    username = ""
                })
                .catch(error => {
                    alertify.error("Неполадки на сервере, пожалуйста подождите", 5);
                });

        },

        register: function () {
            login = document.getElementById("login-login").value
            pass = document.getElementById("login-password").value

            api_axios.post("auth/create/", {
                username: login,
                password: pass,
            })
                .then(response => {
                    alertify.success("Пользователь создан", 5);
                    alertify.success("Теперь вы можете войти", 5);
                })
                .catch(error => {
                    if (error.response.status == 400) {
                        alertify.error("Имя пользователя или пароль введены неверно", 5);
                    } else {
                        alertify.error("Неполадки на сервере, пожалуйста подождите", 5);
                    }
                });

        },

        get_user_data: function () {
            api_axios.get("auth/user/", {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                }
            })
                .then(response => {
                    app.username = response.data.username
                    app.permissions = response.data.permissions
                })
                .catch(error => {
                    console.log(error.response);
                });
        },

        check_token: function () {
            api_axios.post("auth/check/", {
                token: localStorage.getItem('access_token'),
            })
                .then(response => {
                    app.authenticated = true
                    app.get_user_data()

                })
                .catch(error => {
                    console.log(error);
                });
        },

        update_token: function () {
            login = document.getElementById("login-login").value
            pass = document.getElementById("login-password").value

            api_axios.post("auth/login", {
                username: login,
                password: pass,
            })
                .then(response => {
                })
                .catch(error => {
                    console.log(error.response);
                });
        },

        create_room: function () {
            field = document.getElementById("RoomName-input")
            if (field.value) {
                if (field.value.length >= 3) {
                    api_axios.post("chatrooms/", {
                        title: field.value
                    }, {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                        }
                    })
                        .then(response => {
                            field.value = ''
                            $('#createRoomModal').modal('hide')
                            app.update_rooms()
                        })
                        .catch(error => {
                            console.log(error);
                        });
                } else {
                    alertify.error("Имя комнаты должно быть больше трех символов", 5);
                }
            } else {
                alertify.error("Имя комнаты не может быть пустым", 5);
            }
        }
    },
    data: {
        rooms_list: [],
        selected_room: [],
        messages: [],
        //showModal: false,
        authenticated: false,
        username: "",
        permissions: "",
    },

    filters: {
        date: function (value) {
            if (!value) return ''
            d = new Date(value)
            return d.toLocaleString().slice(0, -3);
        },
        room_date: function (value) {
            if (!value) return ''
            d = new Date(value)
            return d.toLocaleDateString();
        }
    },

    mounted() {
        if (localStorage.getItem('access_token')) {
            this.check_token()
            this.update_rooms()
        }
    },
})


