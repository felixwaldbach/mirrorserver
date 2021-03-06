import $ from 'jquery';

const IP_HOST = 'http://localhost:5000';

export const getWunderlistTasks = (accessToken, list_id, client_id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: "https://a.wunderlist.com/api/v1/tasks?list_id=" + list_id,
                cache: false,
                type: "GET",
                contentType: 'application/json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Access-Token": accessToken,
                    "X-Client-ID": client_id
                },
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, status, err) {
                    reject(err);
                }
            }
        );
    });
}

export const getUserData = (userId) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: IP_HOST + "/api/user/getUserData",
                cache: false,
                type: "GET",
                contentType: 'application/json',
                data: {
                    userId: userId
                },
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (xhr, status, err) {
                    reject(err);
                }
            }
        );
    });
}

export const generateQRCode = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: IP_HOST + "/api/qrcode",
                cache: false,
                type: "GET",
                contentType: 'application/json',
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (xhr, status, err) {
                    reject(err);
                }
            }
        );
    });
}
