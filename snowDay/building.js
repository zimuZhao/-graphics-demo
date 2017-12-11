var THREEx = THREEx || {}

THREEx.ProceduralCity = function() {
    // 基础建筑模型 立方体
    var geometry = new THREE.CubeGeometry(1, 1, 1);
    // 将参考点设置在立方体的底部，而不是它的中心，以便我们进行平移操作
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
    // 删除底面
    geometry.faces.splice(3, 1);
    geometry.faceVertexUvs[0].splice(3, 1);
    // 优化绘制小技巧
    // 修复顶面的UV映射，设置为单一的坐标（0,0），
    // 这样屋顶将和地板颜色相同，且建筑物的各面纹理共用，
    // 这样使得我们可以在单一的绘图过程中完成绘制。
    geometry.faceVertexUvs[0][2][0].set(0, 0);
    geometry.faceVertexUvs[0][2][1].set(0, 0);
    geometry.faceVertexUvs[0][2][2].set(0, 0);
    geometry.faceVertexUvs[0][2][3].set(0, 0);

    // 环境光遮蔽（Ambient Occlusion） 向光面和背光面的基本色
    var light = new THREE.Color(0xffffff);
    var shadow = new THREE.Color(0x303050);

    // buildMesh
    var buildingMesh = new THREE.Mesh(geometry);
    var cityGeometry = new THREE.Geometry();
    for (var i = 0; i < 6; i++) {
        buildingMesh.position.set((-100 + i * 110), 0, 40);
        if (i === 1) { //主楼后部建筑
            buildingMesh.scale.set(120, 60, 60);
        } else if (i > 2) { //主楼
            buildingMesh.scale.set(60 / i, 120 / i, 60 / i);
            buildingMesh.position.set(10, (30 + (i - 3) * 120 / (i - 1)), 80);
        } else {
            buildingMesh.scale.set(80, 40, 40);
        }

        // 为每个建筑得到一些随机和特殊的颜色
        var value = 1 - Math.random() * Math.random();
        var baseColor = new THREE.Color().setRGB(value + Math.random() * 1, value, value + Math.random() * 1);
        // 以baseColor作为参考设置上方顶点和下方顶点的颜色
        var topColor = baseColor.clone().multiply(light);
        var bottomColor = baseColor.clone().multiply(shadow);

        var geometry = buildingMesh.geometry;
        for (var j = 0, jl = geometry.faces.length; j < jl; j++) {
            if (j === 2) {
                // 顶面  - 使用该建筑的baseColor
                geometry.faces[j].vertexColors = [baseColor, baseColor, baseColor, baseColor];
            } else {
                // 侧面 - 使用baseColor乘上light作为上方顶点的颜色
                geometry.faces[j].vertexColors = [topColor, bottomColor, bottomColor, topColor];
            }
        }
        // 合并所有建筑为单一的cityGeometry，可以有力的提升性能
        THREE.GeometryUtils.merge(cityGeometry, buildingMesh);
    }

    // 主楼底座
    var mainBottomMesh = new THREE.Mesh(geometry);
    mainBottomMesh.scale.set(60, 30, 30);
    mainBottomMesh.position.set(10, 0, 80);
    THREE.GeometryUtils.merge(cityGeometry, mainBottomMesh);
    //主楼顶部
    var mainTopMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 10));
    mainTopMesh.position.set(10, 120, 80);
    THREE.GeometryUtils.merge(cityGeometry, mainTopMesh);

    /**
     * 纹理 创建Texture对象
     */
    var texture = new THREE.Texture(generateTextureCanvas());
    texture.anisotropy = renderer.getMaxAnisotropy();
    texture.needsUpdate = true;
    var material = new THREE.MeshLambertMaterial({map: texture, vertexColors: THREE.VertexColors});

    // 最终生成mesh对象
    var mesh = new THREE.Mesh(cityGeometry, material);
    return mesh;

}

/**
 * [generateTextureCanvas 生成纹理]
 * 先创建小画布 32*16 根据小画布构建大画布
 * @return {[canvas]} [返回大画布]
 */
function generateTextureCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 16;
    var context = canvas.getContext('2d');
    // 一排窗户，一排地板，如此循环
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 32, 16);

    for (var y = 2; y < 14; y += 2) {
        for (var x = 2; x < 30; x += 2) {
            var value = Math.floor(Math.random() * 64);
            // 随机明暗度
            context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';
            context.fillRect(x, y, 1, 1);
        }
    }
    // 底部台阶
    context.lineWidth = 3;/*边框的宽度*/
    context.strokeRect(0, 16, 32, 1);

    // 增加小画布分辨率 创建更大canvas
    var canvas2 = document.createElement('canvas');
    canvas2.width = 1024;
    canvas2.height = 512;
    var context = canvas2.getContext('2d');
    // 关掉默认的平滑处理
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    // 复制小画布到大画布
    context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
    return canvas2;
} // ends generateTextureCanvas()
