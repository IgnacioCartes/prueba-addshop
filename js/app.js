(function (window, angular, undefined) {

    /*
     * Constantes
     */
    const ANCHO = 600,
        ALTO = 400;

    const ANCHO_PAD = 20,
        ALTO_PAD = 80;

    const TAMANO_BOLA = 20;

    const LIMITE_INFERIOR_PAD = ALTO - ALTO_PAD,
        LIMITE_INFERIOR_BOLA = ALTO - TAMANO_BOLA,
        LIMITE_DERECHO_BOLA = ANCHO - TAMANO_BOLA;

    const VELOCIDAD_PAD = 4,
        VELOCIDAD_BOLA = 5;

    /*
     * Variables encapsuladas
     */
    var animationFrameId;



    /*
     *  Crear aplicación angular
     */
    var app = angular.module('PongApp', []);



    /*
     *  Crear controlador 
     */

    app.controller('PongController', ['$scope', function ($scope) {

        // Variables privadas - fuera del scope
        // Objeto que contiene las teclas y su estatus (true: presionada, false o undefined: no presionada)
        var keys = {};

        // Inicializar variables del scope
        // Altura de los pads
        $scope.alturaPad1 = 160;
        $scope.alturaPad2 = 160;

        // Posicion vertical de los pads
        $scope.izquierda = 10;
        $scope.derecha = ANCHO - ANCHO_PAD - 10;

        // Definir propiedades de bola
        $scope.posicionBola = {};
        $scope.velocidadBola = {};

        /**
         * Inicializa la bola al centro de la arena, y le da una dirección al azar
         * Esta función será rellamada cada vez que se anote un punto pare reinicializar la bola
         */
        $scope.resetearBola = function () {
            // Coordenadas de la bola
            $scope.posicionBola = {
                x: ANCHO / 2,
                y: ALTO / 2
            };

            // Velocidad de la bola - dirección aleatoria
            $scope.velocidadBola = {
                x: (Math.random() > 0.5) ? VELOCIDAD_BOLA : -VELOCIDAD_BOLA,
                y: (Math.random() > 0.5) ? VELOCIDAD_BOLA : -VELOCIDAD_BOLA
            };
        };

        // Inicializar bola
        $scope.resetearBola();

        // Nombres de los participantes
        $scope.nombre1 = window.prompt("Ingresa el nombre del jugador 1:");
        $scope.nombre2 = window.prompt("Ingresa el nombre del jugador 2:");

        // Puntajes
        $scope.puntaje1 = 0;
        $scope.puntaje2 = 0;

        /**
         * Animation Frame - función a ser llamada en cada frame de animacion (60 veces por segundo)
         * Incluída en el $scope para tener acceso a las demás variables del scope
         */
        $scope.animationFrame = function () {

            // Mover según teclas que estén siendo presionadas en este animation frame
            // Flecha Arriba / Flecha Abajo: mover pad 1 (izquierda)
            if (keys.ArrowUp) $scope.alturaPad1 -= VELOCIDAD_PAD;
            if (keys.ArrowDown) $scope.alturaPad1 += VELOCIDAD_PAD;
            // W / S : mover pad 2 (derecha)
            if (keys.w) $scope.alturaPad2 -= VELOCIDAD_PAD;
            if (keys.s) $scope.alturaPad2 += VELOCIDAD_PAD;

            // Limitar movimiento vertical de pads al tablero
            if ($scope.alturaPad1 < 0) $scope.alturaPad1 = 0;
            if ($scope.alturaPad2 < 0) $scope.alturaPad2 = 0;
            if ($scope.alturaPad1 > LIMITE_INFERIOR_PAD) $scope.alturaPad1 = LIMITE_INFERIOR_PAD;
            if ($scope.alturaPad2 > LIMITE_INFERIOR_PAD) $scope.alturaPad2 = LIMITE_INFERIOR_PAD;

            // Mover la bola según su velocidad
            $scope.posicionBola.x += $scope.velocidadBola.x;
            $scope.posicionBola.y += $scope.velocidadBola.y;

            // Rebotar la bola con bordes superior/inferior
            if ($scope.posicionBola.y <= 0) $scope.velocidadBola.y = -$scope.velocidadBola.y;
            if ($scope.posicionBola.y >= LIMITE_INFERIOR_BOLA) $scope.velocidadBola.y = -$scope.velocidadBola.y;

            // Resetear bola si choca con los bordes izquierdo/derecho
            // Y dar puntaje al jugador que anotó el punto
            if ($scope.posicionBola.x < 0) {
                $scope.puntaje2++;
                $scope.resetearBola();
            }
            if ($scope.posicionBola.x > LIMITE_DERECHO_BOLA) {
                $scope.puntaje1++;
                $scope.resetearBola();
            }

            // Detectar colisión de bola con pads
            // Pad izquierdo - rebota a la derecha (vel. positiva)
            if ($scope.posicionBola.x <= ($scope.izquierda + ANCHO_PAD))
                if (($scope.posicionBola.y >= $scope.alturaPad1) && ($scope.posicionBola.y <= ($scope.alturaPad1 + ALTO_PAD)))
                    $scope.velocidadBola.x = VELOCIDAD_BOLA;

            // Pad derecho - rebota a la izquierda (vel. negativa)
            if (($scope.posicionBola.x + ANCHO_PAD) >= $scope.derecha)
                if (($scope.posicionBola.y >= $scope.alturaPad2) && ($scope.posicionBola.y <= ($scope.alturaPad2 + ALTO_PAD)))
                    $scope.velocidadBola.x = -VELOCIDAD_BOLA;



            // Aplicar los cambios para que se reflejen en el DOM
            $scope.$apply();

            // Solicitar un nuevo Animation Frame
            animationFrameId = window.requestAnimationFrame($scope.animationFrame);
        };

        // Escuchar los eventos keydown y keyup para tener un registro de que teclas estan siendo o no presionadas
        window.document.addEventListener('keydown', (evt) => {
            // Registrar keydown (true = tecla presionada)
            keys[evt.key] = true;
        });

        window.document.addEventListener('keyup', (evt) => {
            // Registrar keydown (false = tecla no presionada)
            keys[evt.key] = false;
        });

        // Sacar class invisible al score para mostrarlo una vez que se hayan ingresado los nobmres
        window.document.getElementById("scoreboard").classList.remove("invisible");

        // Llamar al primer animation frame
        animationFrameId = window.requestAnimationFrame($scope.animationFrame);

    }]);



    /*
     *  Directiva pad
     */

    app.directive('pad', function () {
        return {
            restrict: 'E',
            scope: {
                lado: '=',
                posicion: '='
            },
            template: '<div class="pad" ng-attr-style="left: {{ lado }}px; top: {{ posicion }}px"></div>'
        };
    });



    /*
     *  Directiva ball
     */

    app.directive('ball', function () {
        return {
            restrict: 'E',
            scope: {
                posicion: '='
            },
            template: '<div class="ball" ng-attr-style="top: {{ posicion.y }}px; left: {{ posicion.x }}px;"></div>'
        };
    });







})(window, window.angular);