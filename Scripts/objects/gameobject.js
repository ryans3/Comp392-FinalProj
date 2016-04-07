/*
 *  This is a game object script where most of the game objects geomentry is constroucted.
 *
 *  Source File Name:   gameobject.ts
 *  Author Name:        Mohammed Juned Ahmed (300833356)
 *                      Joshua Collaco (300507555)
 *  Last Modified by:   Mohammed Juned Ahmed
 *  Date Last Modified: March 28, 2016
 *  Revision History:   5.0.1
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../typings/tsd.d.ts"/>
var objects;
(function (objects) {
    var gameObject = (function (_super) {
        __extends(gameObject, _super);
        //CONSTRUCTOR ++++++++++++++++++++++++++++++++++++++++++++++++++++
        function gameObject(geometry, material, x, y, z) {
            _super.call(this, geometry, material);
            this._geometry = geometry;
            this._material = material;
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
            this.receiveShadow = true;
            this.castShadow = true;
        }
        return gameObject;
    }(THREE.Mesh));
    objects.gameObject = gameObject;
})(objects || (objects = {}));

//# sourceMappingURL=gameobject.js.map
