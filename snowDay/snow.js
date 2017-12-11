snow();
function snow() {

    var canvas = document.getElementById('Canv');
    var ctx = canvas.getContext('2d');

    // canvas 画布填充整屏
    var W = window.innerWidth;
    // 雪花堆叠在建筑物区域
    var H = (window.innerHeight/2 + 160);
    canvas.width = W;
    canvas.height = H;

    //雪花粒子
    var mp = 400; // 粒子数量
    var particles = [];
    for (var i = 0; i < mp; i++) {
        particles.push({
            x: Math.random() * W, // 横坐标
            y: Math.random() * H, // 纵坐标
            r: Math.random() * 4 + 1, // 半径
            d: Math.random() * mp // 密度
        })
    }

    /**
     * [绘制雪花（白点）]
     */
    function draw() {

        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        for (var i = 0; i < mp; i++) {
            var p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
        update();
    }

    /**
     * 移动雪花
     * angle - 持续增量标志
     * Sin、Cos方法创建粒子的垂直、水平位置
     */
    var angle = 0;

    function update() {
        angle += 0.01;
        for (var i = 0; i < mp; i++) {
            var p = particles[i];
            // 更新横纵坐标
            // cos方法+1防止粒子向上移動
            p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
            p.x += Math.sin(angle) * 2;

            // 粒子退出时从顶部重新发出
            if (p.x > W + 5 || p.x < -5 || p.y > H) {
                if (i % 3 > 0) { //66.67% 的粒子
                    particles[i] = {
                        x: Math.random() * W,
                        y: -10,
                        r: p.r,
                        d: p.d
                    };
                } else {
                    // 如果粒子从右边退出
                    if (Math.sin(angle) > 0) {
                        // 从左边进入
                        particles[i] = {
                            x: -5,
                            y: Math.random() * H,
                            r: p.r,
                            d: p.d
                        };
                    } else {
                        // 从右边进入
                        particles[i] = {
                            x: W + 5,
                            y: Math.random() * H,
                            r: p.r,
                            d: p.d
                        };
                    }
                }
            }
        }
    }

    // 定时循环
    setInterval(draw, 33);
}
