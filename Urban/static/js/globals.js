let globals = {
    MARKERS: [
        {
            url: "/static/img/happy.png",
            description: "Радость",
            infoWindowPlaceholder: "Почему вам здесь радостно?",
            heatmapGradient: [
                'rgba(238,72,0,0)',
                'rgba(255,182,62, 1)',
                'rgba(255,232,69, 1)',
                'rgba(255,255,118, 1)',
                //'rgba(255, 244, 156, 1)',
                //'rgba(242, 239, 212, 1)'
            ],
            colorForAll: 'rgb(254,254,6)'
        },
        {
            url: "/static/img/anger.png",
            description: "Злость",
            infoWindowPlaceholder: "Почему вы здесь злитесь?",
            heatmapGradient: [
                'rgba(255,255,118, 0)',
                'rgba(218,0,35, 1)',
                'rgba(246,0,0, 1)',
                'rgba(244,102,9, 1)'
                //'rgba(221, 28, 0, 1)',
                //'rgba(193, 0, 49, 1)'
            ],
            colorForAll: 'rgb(249, 0, 0)'
        },
        {
            url: "/static/img/sad.png",
            description: "Грусть",
            infoWindowPlaceholder: "Почему вам здесь грустно?",
            heatmapGradient: [
                'rgba(0,165,179, 0)',
                'rgba(0,174,255, 1)',
                'rgba(0,217,255, 1)',
                'rgba(0,245,255, 1)',
                //'rgba(116, 203, 227, 1)',
                //'rgba(83, 160, 219, 1)'
            ],
            colorForAll: 'rgb(0, 255, 252)'
        },
        {
            url: "/static/img/horror.png",
            description: "Страх",
            infoWindowPlaceholder: "Почему вам здесь страшно?",
            heatmapGradient: [
                'rgba(0,51,91, 0)',
                'rgba(0,42,129, 1)',
                'rgba(0,89,173, 1)',
                'rgba(38,111,192, 1)'
                //'rgba(22, 62, 176, 1)',
                //'rgba(27, 27, 133, 1)'
            ],
            colorForAll: 'rgb(2, 3, 254)'
        },
        {
            url: "/static/img/disgust.png",
            description: "Отвращение",
            infoWindowPlaceholder: "Почему вам здесь противно?",
            heatmapGradient: [
                'rgba(38,111,192, 0)',
                'rgba(140,0,154, 1)',
                'rgba(169,73,148, 1)',
                'rgba(235,104,210, 1)',
                //'rgba(152, 73, 156, 1)',
                //'rgba(121, 38, 144, 1)'
            ],
            colorForAll: 'rgb(255, 0, 254)'
        }
    ],
    HEATMAP_GRADIENT: [
        {
            type: "happy",
            gradient: ['rgba(255,182,62,0)', 'rgba(255, 244, 156, 0.7)', 'rgba(255, 255, 113, 1)', 'rgba(255, 230, 68, 1)', 'rgba(255, 186, 67, 1)'] 
        },
        {
            type: "anger",
            gradient: ['rgba(218,5,33,0)', 'rgba(246,0,5,0.7)', 'rgba(244,102,9,1)', 'rgba(255,151,1,1)', 'rgba(255,227,111,1)' ]
        },
        {
            type: "sad",
            gradient: ['rgba(34,173,255,0)', 'rgba(21,216,255,0.7)', 'rgba(17,245,255,1)', 'rgba(112,255,245,1)', 'rgba(188,254,244,1)']
        },
        {
            type: "horror",
            gradient: ['rgba(14,41,128,0)', 'rgba(11,89,173,0.7)', 'rgba(131,186,224,1)', 'rgba(131,186,224,1)', 'rgba(203,227,239,1)']
        },
        {
            type: "disgust",
            gradient: ['rgba(138,11,153,0)', 'rgba(170,72,147,0.7)', 'rgba(233,105,209,1)', 'rgba(221,188,235,1)', 'rgba(238,223,245,1)']
        },  
    ]
};

export default globals;