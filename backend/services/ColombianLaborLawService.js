/**
 * ColombianLaborLawService
 *
 * Centraliza la clasificacion de jornada laboral colombiana usada por
 * asistencias, sesiones de trabajo, estadisticas y dashboard administrador.
 */

class ColombianLaborLawService {
  static obtenerReglasVigentes(fecha, horario = {}) {
    const date = this.obtenerFechaLocal(fecha);
    const rules = {
      maxHorasSemanales: date >= '2026-07-15'
        ? 42
        : date >= '2025-07-15' ? 44 : 46,
      inicioNocturno: date >= '2025-12-25' ? 19 : 21,
      recargoDescanso: date >= '2027-07-01'
        ? 100
        : date >= '2026-07-01'
          ? 90
          : date >= '2025-07-01' ? 80 : 75,
      recargoNocturnoOrdinario: 35,
      recargoExtraDiurna: 25,
      recargoExtraNocturna: 75,
      calculoVersion: 'co-ley-2101-2466-2025'
    };
    if (horario.adopcionJornadaSemanal42Desde &&
        date >= this.obtenerFechaLocal(horario.adopcionJornadaSemanal42Desde)) {
      rules.maxHorasSemanales = 42;
    }
    if (horario.adopcionRecargoDescanso100Desde &&
        date >= this.obtenerFechaLocal(horario.adopcionRecargoDescanso100Desde)) {
      rules.recargoDescanso = 100;
    }
    return rules;
  }

  static obtenerFechaLocal(fecha) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date(fecha)).reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  static obtenerDiaISOLocal(fecha) {
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      weekday: 'short'
    }).format(new Date(fecha));
    return ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 })[weekday];
  }

  static esFestivoColombiano(fecha) {
    const localDate = this.obtenerFechaLocal(fecha);
    const [year, month, day] = localDate.split('-').map(Number);
    const fixed = new Set(['01-01', '05-01', '07-20', '08-07', '12-08', '12-25']);
    if (fixed.has(`${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)) return true;

    const mondayFestivals = [
      [1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11]
    ];
    for (const [festivalMonth, festivalDay] of mondayFestivals) {
      const candidate = new Date(Date.UTC(year, festivalMonth - 1, festivalDay));
      const weekday = candidate.getUTCDay();
      if (weekday !== 1) candidate.setUTCDate(candidate.getUTCDate() + ((8 - weekday) % 7));
      if (candidate.toISOString().slice(0, 10) === localDate) return true;
    }

    const easter = this._easterSunday(year);
    return [-3, -2, 39, 60, 68].some(offset => {
      const festival = new Date(easter);
      festival.setUTCDate(festival.getUTCDate() + offset);
      const weekday = festival.getUTCDay();
      if (![-3, -2].includes(offset) && weekday !== 1) {
        festival.setUTCDate(festival.getUTCDate() + ((8 - weekday) % 7));
      }
      return festival.toISOString().slice(0, 10) === localDate;
    });
  }

  static _easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }

  static JORNADAS = {
    MAXIMA_DIARIA: 8,
    MAXIMA_SEMANAL: 42,
    DIURNA: {
      INICIO: 6,
      FIN: 19
    },
    NOCTURNA: {
      INICIO: 19,
      FIN: 6
    }
  };

  // Porcentajes de RECARGO sobre la hora base (el 100% base no se incluye aqui).
  // Multiplicador efectivo = 1.00 (hora base) + recargo/100.
  //   Ordinaria diurna        -> 1.00  (recargo 0)
  //   Ordinaria nocturna      -> 1.35  (recargo 35)
  //   Extra diurna            -> 1.25  (recargo 25)
  //   Extra nocturna          -> 1.75  (recargo 75)
  //   Dominical/festiva diurna   -> 2.00  (recargo 100)
  //   Dominical/festiva nocturna -> 2.35  (recargo 135 = 100 dominical + 35 nocturno)
  //   Extra dom/fest diurna      -> 2.25  (recargo 125)
  //   Extra dom/fest nocturna    -> 2.75  (recargo 175)
  static RECARGOS = {
    NOCTURNO_ORDINARIO: 35,
    EXTRA_DIURNO: 25,
    EXTRA_NOCTURNO: 75,
    DOMINICAL_DIURNO: 100,
    DOMINICAL_NOCTURNO: 135,
    EXTRA_DOMINICAL_DIURNO: 125,
    EXTRA_DOMINICAL_NOCTURNO: 175,
    DESCANSO_COMPENSATORIO: 100
  };


  static FESTIVOS_FIJOS = [
    { mes: 1, dia: 1 },
    { mes: 5, dia: 1 },
    { mes: 7, dia: 20 },
    { mes: 8, dia: 7 },
    { mes: 12, dia: 8 },
    { mes: 12, dia: 25 }
  ];

  static FESTIVOS_LUNES = [
    { mes: 1, dia: 6 },
    { mes: 3, dia: 19 },
    { mes: 6, dia: 29 },
    { mes: 8, dia: 15 },
    { mes: 10, dia: 12 },
    { mes: 11, dia: 1 },
    { mes: 11, dia: 11 }
  ];

  static formatearTiempo(minutos) {
    const total = Math.max(0, Math.round(minutos || 0));
    const horas = Math.floor(total / 60);
    const mins = total % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static obtenerMaximaSemanal(fecha = new Date()) {
    return this.obtenerReglasVigentes(fecha).maxHorasSemanales;
  }

  static obtenerRecargoDominical(fecha = new Date()) {
    return this.obtenerReglasVigentes(fecha).recargoDescanso;
  }

  static esDomingo(fecha) {
    return new Date(fecha).getDay() === 0;
  }

  static esFestivo(fecha) {
    const ref = new Date(fecha);
    const mes = ref.getMonth() + 1;
    const dia = ref.getDate();

    if (this.FESTIVOS_FIJOS.some(festivo => festivo.mes === mes && festivo.dia === dia)) {
      return true;
    }

    return this.FESTIVOS_LUNES.some(festivo => {
      const fechaFestivo = new Date(ref.getFullYear(), festivo.mes - 1, festivo.dia);
      const day = fechaFestivo.getDay();

      if (day === 0) {
        fechaFestivo.setDate(fechaFestivo.getDate() + 1);
      } else if (day > 1) {
        fechaFestivo.setDate(fechaFestivo.getDate() + (8 - day));
      }

      fechaFestivo.setHours(0, 0, 0, 0);
      const fechaNormalizada = new Date(ref);
      fechaNormalizada.setHours(0, 0, 0, 0);
      return fechaFestivo.getTime() === fechaNormalizada.getTime();
    });
  }

  static esDomingoOFestivo(fecha) {
    return this.esDomingo(fecha) || this.esFestivo(fecha);
  }

  static esHorarioNocturno(timestamp) {
    const hora = new Date(timestamp).getHours();
    return hora >= this.JORNADAS.NOCTURNA.INICIO || hora < this.JORNADAS.NOCTURNA.FIN;
  }

  static calcularDistribucionHoraria(entrada, salida) {
    const resultado = {
      tiempoTotal: 0,
      tiempoDiurno: 0,
      tiempoNocturno: 0,
      detalles: []
    };

    let actual = new Date(entrada);
    const fin = new Date(salida);

    while (actual < fin) {
      const siguienteHito = this.obtenerSiguienteHitoHorario(actual, fin);
      const minutos = Math.floor((siguienteHito - actual) / 60000);

      if (minutos > 0) {
        const esNocturno = this.esHorarioNocturno(actual);
        resultado.tiempoTotal += minutos;

        if (esNocturno) {
          resultado.tiempoNocturno += minutos;
        } else {
          resultado.tiempoDiurno += minutos;
        }

        resultado.detalles.push({
          inicio: new Date(actual),
          fin: new Date(siguienteHito),
          duracionMinutos: minutos,
          tipo: esNocturno ? 'nocturno' : 'diurno'
        });
      }

      actual = new Date(siguienteHito);
    }

    return resultado;
  }

  static obtenerSiguienteHitoHorario(actual, limite) {
    const fecha = new Date(actual);

    const proximoNocturno = new Date(fecha);
    proximoNocturno.setHours(this.JORNADAS.NOCTURNA.INICIO, 0, 0, 0);
    if (proximoNocturno <= actual) {
      proximoNocturno.setDate(proximoNocturno.getDate() + 1);
    }

    const proximoDiurno = new Date(fecha);
    proximoDiurno.setHours(this.JORNADAS.DIURNA.INICIO, 0, 0, 0);
    if (proximoDiurno <= actual) {
      proximoDiurno.setDate(proximoDiurno.getDate() + 1);
    }

    const siguienteHito = proximoNocturno < proximoDiurno ? proximoNocturno : proximoDiurno;
    return siguienteHito > limite ? limite : siguienteHito;
  }

  static crearResultadoBase(entrada, salida, tiempoTotalMinutos, minutosOrdinariosPrevios) {
    const fechaEntrada = new Date(entrada);
    fechaEntrada.setHours(0, 0, 0, 0);

    return {

      tiempoTotal: {
        minutos: tiempoTotalMinutos,
        formato: this.formatearTiempo(tiempoTotalMinutos)
      },
      horasOrdinarias: {
        diurnas: { minutos: 0, formato: '00:00' },
        nocturnas: { minutos: 0, formato: '00:00' },
        total: { minutos: 0, formato: '00:00' }
      },
      horasExtras: {
        diurnas: { minutos: 0, formato: '00:00' },
        nocturnas: { minutos: 0, formato: '00:00' },
        total: { minutos: 0, formato: '00:00' }
      },
      recargos: {
        nocturnoOrdinario: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.NOCTURNO_ORDINARIO },
        extraDiurno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.EXTRA_DIURNO },
        extraNocturno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.EXTRA_NOCTURNO },
        dominicalDiurno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.DOMINICAL_DIURNO },
        dominicalNocturno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.DOMINICAL_NOCTURNO },
        extraDominicalDiurno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.EXTRA_DOMINICAL_DIURNO },
        extraDominicalNocturno: { minutos: 0, formato: '00:00', porcentaje: this.RECARGOS.EXTRA_DOMINICAL_NOCTURNO },
        totalRecargos: { minutos: 0, formato: '00:00' }
      },

      metadata: {
        esDomingoOFestivo: this.esDomingoOFestivo(fechaEntrada),
        tiempoTotalHoras: Math.round((tiempoTotalMinutos / 60) * 100) / 100,
        minutosOrdinariosPrevios: Math.max(0, minutosOrdinariosPrevios || 0),
        excedeLimiteOrdinario: (minutosOrdinariosPrevios || 0) + tiempoTotalMinutos > this.JORNADAS.MAXIMA_DIARIA * 60,
        distribucionHoraria: []
      }
    };
  }

  static calcularRecargos(entrada, salida, tiempoTotalMinutos = null) {
    return this.calcularRecargosConAcumulado(entrada, salida, 0, tiempoTotalMinutos);
  }

  static calcularRecargosConAcumulado(entrada, salida, minutosOrdinariosPrevios = 0, tiempoTotalMinutos = null) {
    const inicio = new Date(entrada);
    const fin = new Date(salida);
    const totalMinutos = Number.isFinite(tiempoTotalMinutos)
      ? Math.max(0, Math.floor(tiempoTotalMinutos))
      : Math.max(0, Math.floor((fin - inicio) / 60000));

    const resultado = this.crearResultadoBase(inicio, fin, totalMinutos, minutosOrdinariosPrevios);
    const distribucion = this.calcularDistribucionHoraria(inicio, fin);
    resultado.metadata.distribucionHoraria = distribucion.detalles;

    // Clasificacion UNIFICADA de tiempo (ordinaria/extra x diurna/nocturna),
    // valida tanto para dias habiles como para domingos/festivos. La unica
    // diferencia entre ambos es el porcentaje de recargo aplicado (RECARGOS).
    // Se respeta el limite de jornada ordinaria (8h, con acumulado previo) para
    // separar correctamente las horas extra tambien en domingos/festivos.
    let ordinariosAcumulados = Math.max(0, minutosOrdinariosPrevios || 0);
    const limiteOrdinario = this.JORNADAS.MAXIMA_DIARIA * 60;

    distribucion.detalles.forEach(segmento => {
      let pendientes = segmento.duracionMinutos;
      const esNocturno = segmento.tipo === 'nocturno';
      const cupoOrdinario = Math.max(0, limiteOrdinario - ordinariosAcumulados);
      const ordinarios = Math.min(pendientes, cupoOrdinario);

      if (ordinarios > 0) {
        if (esNocturno) {
          resultado.horasOrdinarias.nocturnas.minutos += ordinarios;
        } else {
          resultado.horasOrdinarias.diurnas.minutos += ordinarios;
        }
        ordinariosAcumulados += ordinarios;
        pendientes -= ordinarios;
      }

      if (pendientes > 0) {
        if (esNocturno) {
          resultado.horasExtras.nocturnas.minutos += pendientes;
        } else {
          resultado.horasExtras.diurnas.minutos += pendientes;
        }
      }
    });

    const R = this.RECARGOS;
    if (resultado.metadata.esDomingoOFestivo) {
      // Multiplicadores oficiales dominical/festivo:
      // ordinaria diurna 2.00 (+100), ordinaria nocturna 2.35 (+135),
      // extra diurna 2.25 (+125), extra nocturna 2.75 (+175).
      resultado.recargos.dominicalDiurno.minutos = Math.round(
        (resultado.horasOrdinarias.diurnas.minutos * R.DOMINICAL_DIURNO) / 100
      );
      resultado.recargos.dominicalNocturno.minutos = Math.round(
        (resultado.horasOrdinarias.nocturnas.minutos * R.DOMINICAL_NOCTURNO) / 100
      );
      resultado.recargos.extraDominicalDiurno.minutos = Math.round(
        (resultado.horasExtras.diurnas.minutos * R.EXTRA_DOMINICAL_DIURNO) / 100
      );
      resultado.recargos.extraDominicalNocturno.minutos = Math.round(
        (resultado.horasExtras.nocturnas.minutos * R.EXTRA_DOMINICAL_NOCTURNO) / 100
      );
    } else {
      // Multiplicadores oficiales dia habil:
      // ordinaria nocturna 1.35 (+35), extra diurna 1.25 (+25), extra nocturna 1.75 (+75).
      resultado.recargos.nocturnoOrdinario.minutos = Math.round(
        (resultado.horasOrdinarias.nocturnas.minutos * R.NOCTURNO_ORDINARIO) / 100
      );
      resultado.recargos.extraDiurno.minutos = Math.round(
        (resultado.horasExtras.diurnas.minutos * R.EXTRA_DIURNO) / 100
      );
      resultado.recargos.extraNocturno.minutos = Math.round(
        (resultado.horasExtras.nocturnas.minutos * R.EXTRA_NOCTURNO) / 100
      );
    }

    this.formatearTodosLosTiempos(resultado);

    return resultado;
  }

  static sumarCalculos(calculos) {
    const total = this.crearResultadoBase(new Date(), new Date(), 0, 0);
    total.metadata.esDomingoOFestivo = calculos.some(c => c.metadata?.esDomingoOFestivo);

    calculos.forEach(item => {
      total.tiempoTotal.minutos += item.tiempoTotal?.minutos || 0;
      total.horasOrdinarias.diurnas.minutos += item.horasOrdinarias?.diurnas?.minutos || 0;
      total.horasOrdinarias.nocturnas.minutos += item.horasOrdinarias?.nocturnas?.minutos || 0;
      total.horasExtras.diurnas.minutos += item.horasExtras?.diurnas?.minutos || 0;
      total.horasExtras.nocturnas.minutos += item.horasExtras?.nocturnas?.minutos || 0;
      total.recargos.nocturnoOrdinario.minutos += item.recargos?.nocturnoOrdinario?.minutos || 0;
      total.recargos.extraDiurno.minutos += item.recargos?.extraDiurno?.minutos || 0;
      total.recargos.extraNocturno.minutos += item.recargos?.extraNocturno?.minutos || 0;
      total.recargos.dominicalDiurno.minutos += item.recargos?.dominicalDiurno?.minutos || 0;
      total.recargos.dominicalNocturno.minutos += item.recargos?.dominicalNocturno?.minutos || 0;
      total.recargos.extraDominicalDiurno.minutos += item.recargos?.extraDominicalDiurno?.minutos || 0;
      total.recargos.extraDominicalNocturno.minutos += item.recargos?.extraDominicalNocturno?.minutos || 0;
    });


    this.formatearTodosLosTiempos(total);
    return total;
  }

  static formatearTodosLosTiempos(objeto) {
    objeto.tiempoTotal.formato = this.formatearTiempo(objeto.tiempoTotal.minutos);
    objeto.horasOrdinarias.total.minutos =
      objeto.horasOrdinarias.diurnas.minutos + objeto.horasOrdinarias.nocturnas.minutos;
    objeto.horasExtras.total.minutos =
      objeto.horasExtras.diurnas.minutos + objeto.horasExtras.nocturnas.minutos;
    objeto.recargos.totalRecargos.minutos =
      objeto.recargos.nocturnoOrdinario.minutos +
      objeto.recargos.extraDiurno.minutos +
      objeto.recargos.extraNocturno.minutos +
      objeto.recargos.dominicalDiurno.minutos +
      objeto.recargos.dominicalNocturno.minutos +
      (objeto.recargos.extraDominicalDiurno?.minutos || 0) +
      (objeto.recargos.extraDominicalNocturno?.minutos || 0);


    objeto.horasOrdinarias.diurnas.formato = this.formatearTiempo(objeto.horasOrdinarias.diurnas.minutos);
    objeto.horasOrdinarias.nocturnas.formato = this.formatearTiempo(objeto.horasOrdinarias.nocturnas.minutos);
    objeto.horasOrdinarias.total.formato = this.formatearTiempo(objeto.horasOrdinarias.total.minutos);
    objeto.horasExtras.diurnas.formato = this.formatearTiempo(objeto.horasExtras.diurnas.minutos);
    objeto.horasExtras.nocturnas.formato = this.formatearTiempo(objeto.horasExtras.nocturnas.minutos);
    objeto.horasExtras.total.formato = this.formatearTiempo(objeto.horasExtras.total.minutos);

    Object.keys(objeto.recargos).forEach(key => {
      if (objeto.recargos[key].minutos !== undefined) {
        objeto.recargos[key].formato = this.formatearTiempo(objeto.recargos[key].minutos);
      }
    });
  }

  static validarLimitesLegales(horasSemanales, horasDiarias, fecha = new Date()) {
    const limiteSemanal = this.obtenerMaximaSemanal(fecha);
    const validacion = {
      cumpleLimites: true,
      violaciones: [],
      advertencias: [],
      limiteSemanal
    };

    if (horasDiarias > this.JORNADAS.MAXIMA_DIARIA) {
      validacion.cumpleLimites = false;
      validacion.violaciones.push({
        tipo: 'LIMITE_DIARIO_EXCEDIDO',
        limite: this.JORNADAS.MAXIMA_DIARIA,
        actual: horasDiarias,
        diferencia: horasDiarias - this.JORNADAS.MAXIMA_DIARIA
      });
    }

    if (horasSemanales > limiteSemanal) {
      validacion.cumpleLimites = false;
      validacion.violaciones.push({
        tipo: 'LIMITE_SEMANAL_EXCEDIDO',
        limite: limiteSemanal,
        actual: horasSemanales,
        diferencia: horasSemanales - limiteSemanal
      });
    }

    if (horasDiarias > 7 && horasDiarias <= this.JORNADAS.MAXIMA_DIARIA) {
      validacion.advertencias.push({
        tipo: 'APROXIMACION_LIMITE_DIARIO',
        mensaje: 'Aproximandose al limite diario de 8 horas'
      });
    }

    if (horasSemanales > limiteSemanal - 4 && horasSemanales <= limiteSemanal) {
      validacion.advertencias.push({
        tipo: 'APROXIMACION_LIMITE_SEMANAL',
        mensaje: `Aproximandose al limite semanal de ${limiteSemanal} horas`
      });
    }

    return validacion;
  }

  static calcularValorMonetarioRecargos(recargos, salarioHora) {
    const salarioMinuto = salarioHora / 60;
    const valores = {
      nocturnoOrdinario: Math.round((recargos.nocturnoOrdinario?.minutos || 0) * salarioMinuto),
      extraDiurno: Math.round((recargos.extraDiurno?.minutos || 0) * salarioMinuto),
      extraNocturno: Math.round((recargos.extraNocturno?.minutos || 0) * salarioMinuto),
      dominicalDiurno: Math.round((recargos.dominicalDiurno?.minutos || 0) * salarioMinuto),
      dominicalNocturno: Math.round((recargos.dominicalNocturno?.minutos || 0) * salarioMinuto),
      totalRecargos: 0
    };

    valores.totalRecargos =
      valores.nocturnoOrdinario +
      valores.extraDiurno +
      valores.extraNocturno +
      valores.dominicalDiurno +
      valores.dominicalNocturno;

    return valores;
  }

  static generarReporteLegal(calculos) {
    const reporte = {
      fecha: new Date(),
      legislacionAplicada: [],
      articulos: [],
      resumen: {}
    };

    if (calculos.metadata?.esDomingoOFestivo) {
      reporte.legislacionAplicada.push('Trabajo en dia de descanso obligatorio o festivo');
      reporte.articulos.push('Art. 179 CST, modificado por Ley 2466 de 2025');
    }

    if ((calculos.recargos?.nocturnoOrdinario?.minutos || 0) > 0) {
      reporte.legislacionAplicada.push('Trabajo nocturno ordinario');
      reporte.articulos.push('Art. 160 y 168 CST');
    }

    if ((calculos.horasExtras?.total?.minutos || 0) > 0) {
      reporte.legislacionAplicada.push('Horas extras');
      reporte.articulos.push('Art. 159 CST y Ley 2466 de 2025');
    }

    reporte.resumen = {
      tiempoTotal: calculos.metadata?.tiempoTotalHoras || 0,
      excedeLimiteOrdinario: !!calculos.metadata?.excedeLimiteOrdinario,
      aplicaRecargos: (calculos.recargos?.totalRecargos?.minutos || 0) > 0,
      cumpleLegislacion: true
    };

    return reporte;
  }
}

module.exports = ColombianLaborLawService;
