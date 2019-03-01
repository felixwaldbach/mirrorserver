import $ from 'jquery';
import responseMessages from '../responseMessages';
import config from '../config';

export const getWunderlistTasks = (accessToken, list_id, client_id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: "https://a.wunderlist.com/api/v1/tasks?list_id=" + list_id,
                cache: false,
                type: "GET",
                contentType: 'application/json',
                headers: {
                    "X-Access-Token": accessToken,
                    "X-Client-ID": client_id
                },
                data: {
                    list_id: list_id
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

export const getUserWidgets = (user_id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: config.SERVER_ADDRESS + ":" + config.SOCKET_SERVER_PORT + "/api/user/getUserWidgets",
                cache: false,
                type: "GET",
                contentType: 'application/json',
                data: {
                    user_id: user_id
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

export const getCameraPicture = (mirror_uuid) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: config.SERVER_ADDRESS + ":" + config.SOCKET_SERVER_PORT + "/api/camera/recognizeimage",
                cache: false,
                type: "GET",
                contentType: 'application/json',
                data: {
                    mirror_uuid: mirror_uuid
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

export const getStoreTrainDataset = (mirror_uuid, user_id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                url: config.SERVER_ADDRESS + ":" + config.SOCKET_SERVER_PORT + "/api/camera/storetrain",
                cache: false,
                type: "GET",
                contentType: 'application/json',
                data: {
                    mirror_uuid: mirror_uuid,
                    user_id: user_id
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