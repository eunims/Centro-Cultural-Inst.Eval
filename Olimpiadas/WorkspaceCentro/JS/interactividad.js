/* === INICIO DE LAS INTERACCIONES CUANDO EL DOCUMENTO ESTÁ LISTO === */
document.addEventListener('DOMContentLoaded', () => {
    /* === PRESELECCIONAR EL TALLER INDICADO EN EL ENLACE === */
    const selectorTaller = document.querySelector('#taller');
    const parametrosDireccion = new URLSearchParams(window.location.search);
    const tallerSolicitado = parametrosDireccion.get('taller');

    if (selectorTaller instanceof HTMLSelectElement && tallerSolicitado) {
        const opcionTaller = Array.from(selectorTaller.options).find((opcion) => opcion.value === tallerSolicitado);
        if (opcionTaller) selectorTaller.value = tallerSolicitado;
    }

    /* === MANTENER LAS RUTAS DE IMAGEN Y MOSTRAR UNA MARCA SI FALTAN ARCHIVOS === */
    const prepararImagen = (imagen) => {
        if (imagen.dataset.recursoPreparado === 'true') return;
        imagen.dataset.recursoPreparado = 'true';

        const mostrarSustituto = () => {
            if (imagen.classList.contains('recurso-visual-ausente')) return;
            imagen.classList.add('recurso-visual-ausente');

            const ilustracion = document.createElement('span');
            ilustracion.className = 'ilustracion-sin-foto';
            ilustracion.setAttribute('role', 'img');
            ilustracion.setAttribute('aria-label', imagen.alt || 'Imagen del Centro Cultural');
            imagen.insertAdjacentElement('afterend', ilustracion);
        };

        imagen.addEventListener('error', mostrarSustituto);
        if (imagen.complete && imagen.naturalWidth === 0) mostrarSustituto();
    };

    document.querySelectorAll('img[src]').forEach(prepararImagen);

    /* === OCULTAR EL ENCABEZADO AL BAJAR Y MOSTRARLO AL SUBIR === */
    const encabezado = document.querySelector('.encabezado');

    if (encabezado) {
        let ultimaPosicionDesplazamiento = window.scrollY;
        let desplazamientoAcumulado = 0;
        const umbralDesplazamiento = 6;
        const movimientoReducidoEncabezado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        encabezado.style.transition = movimientoReducidoEncabezado ? 'none' : 'transform 240ms ease';
        encabezado.style.willChange = 'transform';

        const mostrarEncabezado = () => {
            encabezado.style.transform = 'translateY(0)';
            desplazamientoAcumulado = 0;
        };

        const actualizarEncabezado = () => {
            const posicionActual = window.scrollY;
            const diferenciaDesplazamiento = posicionActual - ultimaPosicionDesplazamiento;
            ultimaPosicionDesplazamiento = posicionActual;

            const menuAbierto = document.querySelector('[data-menu-principal].menu-abierto');
            const submenuAbierto = document.querySelector('.elemento-desplegable.desplegable-abierto');
            const encabezadoEnfocado = encabezado.contains(document.activeElement);

            if (posicionActual <= encabezado.offsetHeight || menuAbierto || submenuAbierto || encabezadoEnfocado) {
                mostrarEncabezado();
                return;
            }

            if (Math.abs(diferenciaDesplazamiento) < 1) return;

            if (desplazamientoAcumulado !== 0 && Math.sign(diferenciaDesplazamiento) !== Math.sign(desplazamientoAcumulado)) {
                desplazamientoAcumulado = diferenciaDesplazamiento;
            } else {
                desplazamientoAcumulado += diferenciaDesplazamiento;
            }

            if (desplazamientoAcumulado >= umbralDesplazamiento) {
                encabezado.style.transform = 'translateY(-100%)';
                desplazamientoAcumulado = 0;
            } else if (desplazamientoAcumulado <= -umbralDesplazamiento) {
                mostrarEncabezado();
            }
        };

        window.addEventListener('scroll', actualizarEncabezado, { passive: true });
        encabezado.addEventListener('focusin', mostrarEncabezado);
        actualizarEncabezado();
    }

    /* === APERTURA Y CIERRE DEL MENÚ MÓVIL === */
    const botonMenu = document.querySelector('[data-boton-menu]');
    const menuPrincipal = document.querySelector('[data-menu-principal]');

    if (botonMenu && menuPrincipal) {
        const cambiarMenu = (estaAbierto) => {
            botonMenu.setAttribute('aria-expanded', String(estaAbierto));
            botonMenu.setAttribute('aria-label', estaAbierto ? 'Cerrar menú' : 'Abrir menú');
            menuPrincipal.classList.toggle('menu-abierto', estaAbierto);
        };

        botonMenu.addEventListener('click', () => {
            cambiarMenu(botonMenu.getAttribute('aria-expanded') !== 'true');
        });

        menuPrincipal.querySelectorAll('a').forEach((enlace) => {
            enlace.addEventListener('click', () => cambiarMenu(false));
        });

        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') cambiarMenu(false);
        });
    }

    /* === CONTROL DEL SUBMENÚ DE TALLERES === */
    const botonesSubmenu = document.querySelectorAll('[data-alternar-submenu]');

    botonesSubmenu.forEach((botonSubmenu) => {
        const elementoDesplegable = botonSubmenu.closest('.elemento-desplegable');
        if (!elementoDesplegable) return;

        const cambiarSubmenu = (estaAbierto) => {
            elementoDesplegable.classList.toggle('desplegable-abierto', estaAbierto);
            botonSubmenu.setAttribute('aria-expanded', String(estaAbierto));
            botonSubmenu.setAttribute('aria-label', estaAbierto ? 'Ocultar talleres' : 'Mostrar talleres');
        };

        botonSubmenu.addEventListener('click', () => {
            cambiarSubmenu(!elementoDesplegable.classList.contains('desplegable-abierto'));
        });

        elementoDesplegable.addEventListener('focusin', (evento) => {
            if (evento.target !== botonSubmenu) cambiarSubmenu(true);
        });
        elementoDesplegable.addEventListener('focusout', (evento) => {
            if (!elementoDesplegable.contains(evento.relatedTarget)) {
                cambiarSubmenu(false);
            }
        });
    });

    document.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) return;
        document.querySelectorAll('.elemento-desplegable.desplegable-abierto').forEach((elementoDesplegable) => {
            if (!elementoDesplegable.contains(evento.target)) {
                elementoDesplegable.classList.remove('desplegable-abierto');
                const botonSubmenu = elementoDesplegable.querySelector('[data-alternar-submenu]');
                botonSubmenu?.setAttribute('aria-expanded', 'false');
                botonSubmenu?.setAttribute('aria-label', 'Mostrar talleres');
            }
        });
    });

    /* === CIERRE DEL MENÚ Y DEL SUBMENÚ CON LA TECLA ESCAPE === */
    document.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Escape') return;
        document.querySelectorAll('.elemento-desplegable.desplegable-abierto').forEach((elementoDesplegable) => {
            elementoDesplegable.classList.remove('desplegable-abierto');
            const botonSubmenu = elementoDesplegable.querySelector('[data-alternar-submenu]');
            botonSubmenu?.setAttribute('aria-expanded', 'false');
            botonSubmenu?.setAttribute('aria-label', 'Mostrar talleres');
        });
    });

    /* === CAMBIO AUTOMÁTICO Y MANUAL DE DIAPOSITIVAS === */
    const deslizadores = document.querySelectorAll('[data-deslizador]');
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    deslizadores.forEach((deslizador) => {
        const diapositivas = Array.from(deslizador.querySelectorAll('.diapositiva'));
        const botonAnterior = deslizador.querySelector('[data-diapositiva-anterior]');
        const botonSiguiente = deslizador.querySelector('[data-diapositiva-siguiente]');
        if (diapositivas.length < 2) return;

        let indiceDiapositiva = Math.max(0, diapositivas.findIndex((diapositiva) => diapositiva.classList.contains('activa')));
        let temporizadorDeslizador;

        const mostrarDiapositiva = (nuevoIndice) => {
            indiceDiapositiva = (nuevoIndice + diapositivas.length) % diapositivas.length;
            diapositivas.forEach((diapositiva, indice) => {
                const estaActiva = indice === indiceDiapositiva;
                diapositiva.classList.toggle('activa', estaActiva);
                diapositiva.setAttribute('aria-hidden', String(!estaActiva));
            });
        };

        const iniciarTemporizador = () => {
            window.clearInterval(temporizadorDeslizador);
            if (!movimientoReducido && !document.hidden) {
                temporizadorDeslizador = window.setInterval(() => mostrarDiapositiva(indiceDiapositiva + 1), 4000);
            }
        };

        botonAnterior?.addEventListener('click', () => {
            mostrarDiapositiva(indiceDiapositiva - 1);
            iniciarTemporizador();
        });
        botonSiguiente?.addEventListener('click', () => {
            mostrarDiapositiva(indiceDiapositiva + 1);
            iniciarTemporizador();
        });
        deslizador.addEventListener('mouseenter', () => window.clearInterval(temporizadorDeslizador));
        deslizador.addEventListener('mouseleave', iniciarTemporizador);
        deslizador.addEventListener('focusin', () => window.clearInterval(temporizadorDeslizador));
        deslizador.addEventListener('focusout', iniciarTemporizador);
        document.addEventListener('visibilitychange', iniciarTemporizador);

        mostrarDiapositiva(indiceDiapositiva);
        iniciarTemporizador();
    });

    /* === APERTURA, NAVEGACIÓN Y CIERRE DEL LIGHTBOX === */
    const miniaturasGaleria = Array.from(document.querySelectorAll('[data-miniatura-galeria]'));
    if (miniaturasGaleria.length) {
        let indiceImagenActual = 0;
        let botonQueAbrioModal;

        const modalGaleria = document.createElement('div');
        modalGaleria.className = 'modal-galeria';
        modalGaleria.setAttribute('role', 'dialog');
        modalGaleria.setAttribute('aria-modal', 'true');
        modalGaleria.setAttribute('aria-label', 'Galería de imágenes');
        modalGaleria.hidden = true;

        const botonCerrar = document.createElement('button');
        botonCerrar.className = 'control-modal boton-cerrar-modal';
        botonCerrar.type = 'button';
        botonCerrar.textContent = '×';
        botonCerrar.setAttribute('aria-label', 'Cerrar galería');

        const botonAnterior = document.createElement('button');
        botonAnterior.className = 'control-modal boton-anterior-modal';
        botonAnterior.type = 'button';
        botonAnterior.textContent = '‹';
        botonAnterior.setAttribute('aria-label', 'Imagen anterior');

        const imagenModal = document.createElement('img');
        imagenModal.className = 'imagen-modal';

        const ilustracionModal = document.createElement('span');
        ilustracionModal.className = 'ilustracion-sin-foto ilustracion-modal';
        ilustracionModal.hidden = true;

        const botonSiguiente = document.createElement('button');
        botonSiguiente.className = 'control-modal boton-siguiente-modal';
        botonSiguiente.type = 'button';
        botonSiguiente.textContent = '›';
        botonSiguiente.setAttribute('aria-label', 'Imagen siguiente');

        const textoModal = document.createElement('p');
        textoModal.className = 'texto-modal';
        textoModal.setAttribute('aria-live', 'polite');

        modalGaleria.append(botonCerrar, botonAnterior, imagenModal, ilustracionModal, botonSiguiente, textoModal);
        document.body.append(modalGaleria);

        const actualizarImagenModal = () => {
            const miniaturaActual = miniaturasGaleria[indiceImagenActual];
            const imagenMiniatura = miniaturaActual.querySelector('img');
            if (!imagenMiniatura) return;
            const imagenDisponible = !imagenMiniatura.classList.contains('recurso-visual-ausente');
            imagenModal.hidden = !imagenDisponible;
            ilustracionModal.hidden = imagenDisponible;
            ilustracionModal.setAttribute('aria-label', imagenMiniatura.alt || 'Imagen del Centro Cultural');
            if (imagenDisponible) {
                imagenModal.src = imagenMiniatura.currentSrc || imagenMiniatura.src;
                imagenModal.alt = imagenMiniatura.alt;
            } else {
                imagenModal.removeAttribute('src');
            }
            textoModal.textContent = `${indiceImagenActual + 1} de ${miniaturasGaleria.length} · ${imagenMiniatura.alt}`;
        };

        const cerrarModal = () => {
            modalGaleria.hidden = true;
            document.body.style.removeProperty('overflow');
            botonQueAbrioModal?.focus();
        };

        miniaturasGaleria.forEach((miniatura, indice) => {
            miniatura.addEventListener('click', () => {
                indiceImagenActual = indice;
                botonQueAbrioModal = miniatura;
                actualizarImagenModal();
                modalGaleria.hidden = false;
                document.body.style.overflow = 'hidden';
                botonCerrar.focus();
            });
        });

        botonCerrar.addEventListener('click', cerrarModal);
        botonAnterior.addEventListener('click', () => {
            indiceImagenActual = (indiceImagenActual - 1 + miniaturasGaleria.length) % miniaturasGaleria.length;
            actualizarImagenModal();
        });
        botonSiguiente.addEventListener('click', () => {
            indiceImagenActual = (indiceImagenActual + 1) % miniaturasGaleria.length;
            actualizarImagenModal();
        });
        modalGaleria.addEventListener('click', (evento) => {
            if (evento.target === modalGaleria) cerrarModal();
        });
        modalGaleria.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') cerrarModal();
            if (evento.key === 'ArrowLeft') botonAnterior.click();
            if (evento.key === 'ArrowRight') botonSiguiente.click();
            if (evento.key === 'Tab') {
                const botonesEnfocables = modalGaleria.querySelectorAll('button:not(:disabled)');
                const primerBoton = botonesEnfocables[0];
                const ultimoBoton = botonesEnfocables[botonesEnfocables.length - 1];
                if (evento.shiftKey && document.activeElement === primerBoton) {
                    evento.preventDefault();
                    ultimoBoton.focus();
                } else if (!evento.shiftKey && document.activeElement === ultimoBoton) {
                    evento.preventDefault();
                    primerBoton.focus();
                }
            }
        });
    }
});
