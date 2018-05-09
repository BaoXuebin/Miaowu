$(function() {
    $('#keyword').keydown(function(e) {
        if (e.keyCode === 13) {
            var keyword = $.trim($(this).val());
            search(keyword);
        }
    });

    $('button').click(function() {
        getTitle();
    });
});

var Constants = {
    url: 'http://fanyi.youdao.com/openapi.do',
    keyFrom: 'python-self-app',
    key: '588759537'
};

function search(keyword) {
    var errors = {
        0: '正常',
        20: '要翻译的文本过长',
        30: '无法进行有效的翻译',
        40: '不支持的语言类型',
        50: '无效的key',
        60: '无词典结果'
    };
    var code = 0;
    var content = {};

    var task = setTimeout(function() {
        $('#input').addClass('loading');
    }, 200);
    $.ajax({
        type: 'get',
        url: `${Constants.url}?keyfrom=${Constants.keyFrom}&key=${Constants.key}&type=data&doctype=json&version=1.1&q=${keyword}`,
        timeout: 5000,
        success: function(result) {
            code = result.errorCode;
            if (code !== 0) {
                content.query = errors[code] || '查询异常';
            } else { // 查询成功
                content.query = result.query;
                if (result.basic) {
                    content.explains = result.basic.explains || [];
                } else {
                    content.query = '未查询到结果';
                }
            }
            render(content, task);
        },
        error: function(e) {
            console.error(e);
            content.query = '查询异常';
            render(content, task);
        }
    });
}

function render(content, task) {
    clearTimeout(task);
    $('#query').text(content.query);
    $('#explains').html(content.explains ? content.explains.join('<br>') : '');
    $('#input').removeClass('loading');
}

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    var tab = tabs[0];
    chrome.tabs.sendRequest(tab.id, {method: 'getSelection'}, function (response) {
        $('#keyword').val(response ? response.data : '');
        search($('#keyword').val());
    });
});