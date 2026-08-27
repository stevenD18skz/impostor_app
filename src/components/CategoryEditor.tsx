'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { BookPlus, Check, Pencil, Plus, Trash2, X } from 'lucide-react';

import {
  CATEGORY_LIMITS,
  categoryProblem,
  deleteCustomCategory,
  getCategoriesServerSnapshot,
  getCategoriesSnapshot,
  parseWords,
  saveCustomCategory,
  subscribeCategories,
  type CategoryWords,
  type CustomCategory,
} from '@/lib/categories';

/*
  El editor de categorías propias, compartido por el modo local y el online.

  Se escriben en una sola caja de texto en vez de campo por campo: la gente ya
  tiene su lista en la cabeza o en el portapapeles, y obligarla a pulsar
  «añadir» cincuenta veces es la manera más rápida de que no la escriba. Se
  aceptan comas y saltos de línea porque las listas vienen de las dos formas.

  Guardar y usar es un solo botón. Separarlos haría que la categoría recién
  escrita se quedara guardada sin llegar a la partida, que es justo lo que
  nadie quiere en ese momento.
*/

interface CategoryEditorProps {
  onClose: () => void;
  /** Se la lleva a la partida. El guardado en este navegador ya está hecho. */
  onUse: (words: CategoryWords) => void;
  /** La que está en juego ahora, para marcarla en la lista. */
  current: CategoryWords | null;
}

const EMPTY = { id: undefined as string | undefined, nombre: '', raw: '' };

export default function CategoryEditor({ onClose, onUse, current }: CategoryEditorProps) {
  // El editor se monta al abrirse, así que el borrador nace limpio sin que
  // haya que reiniciarlo a mano cada vez.
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  // Leer localStorage es leer un sistema externo, no derivar estado de React.
  // Además, guardar avisa a la lista sola: no hay nada que refrescar a mano.
  const saved = useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getCategoriesServerSnapshot,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const palabras = useMemo(() => parseWords(draft.raw), [draft.raw]);
  const problem = categoryProblem(draft.nombre, palabras);
  const editing = draft.id !== undefined;

  const edit = (cat: CustomCategory) => {
    setDraft({ id: cat.id, nombre: cat.nombre, raw: cat.palabras.join('\n') });
    setError(null);
  };

  const remove = (id: string) => {
    deleteCustomCategory(id);
    if (draft.id === id) setDraft(EMPTY);
  };

  const submit = () => {
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const { saved: cat } = saveCustomCategory({
        id: draft.id,
        nombre: draft.nombre,
        palabras,
      });
      onUse({ nombre: cat.nombre, palabras: cat.palabras });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  const counter = `${palabras.length} ${palabras.length === 1 ? 'palabra' : 'palabras'}`;
  const short = palabras.length < CATEGORY_LIMITS.minPalabras;
  const full = palabras.length >= CATEGORY_LIMITS.maxPalabras;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crear categoría"
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[86vh] flex flex-col bg-slate-800 border-4 border-cyan-800 shadow-[0_0_40px_rgba(34,211,238,0.2)] text-left"
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b-2 border-slate-700 shrink-0">
          <BookPlus size={26} strokeWidth={3} className="text-pink-500 shrink-0" />
          <h3 className="flex-1 text-cyan-400 text-2xl font-bold">
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-5">
          {saved.length > 0 && (
            <section className="space-y-2">
              <p className="text-slate-400 text-lg uppercase tracking-widest">Tus categorías</p>
              <div className="flex flex-wrap gap-2">
                {saved.map((cat) => {
                  const inPlay = current?.nombre === cat.nombre;
                  return (
                    <span
                      key={cat.id}
                      className={`flex items-center gap-1 border-2 ${
                        draft.id === cat.id
                          ? 'border-pink-500 bg-pink-600/20'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      <button
                        onClick={() => onUse({ nombre: cat.nombre, palabras: cat.palabras })}
                        title="Jugar con esta categoría"
                        className="flex items-center gap-2 pl-3 py-2 text-white text-lg hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {inPlay && <Check size={16} strokeWidth={4} className="text-emerald-400" />}
                        {cat.nombre}
                        <span className="text-slate-500 text-base">{cat.palabras.length}</span>
                      </button>
                      <button
                        onClick={() => edit(cat)}
                        aria-label={`Editar ${cat.nombre}`}
                        className="p-2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <Pencil size={16} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => remove(cat.id)}
                        aria-label={`Borrar ${cat.nombre}`}
                        className="p-2 pr-3 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </span>
                  );
                })}
              </div>
              {editing && (
                <button
                  onClick={() => setDraft(EMPTY)}
                  className="flex items-center gap-1 text-cyan-400 text-lg hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Plus size={18} strokeWidth={3} />
                  Empezar una nueva
                </button>
              )}
            </section>
          )}

          <section className="space-y-2">
            <label htmlFor="cat-nombre" className="block text-cyan-400 text-lg uppercase tracking-widest">
              Nombre
            </label>
            <input
              id="cat-nombre"
              autoFocus
              value={draft.nombre}
              onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
              maxLength={CATEGORY_LIMITS.nombreMax}
              placeholder="Ej: Cosas del salón"
              className="w-full px-4 py-3 text-2xl bg-slate-900 text-white border-2 border-cyan-700 placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </section>

          <section className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="cat-palabras" className="text-cyan-400 text-lg uppercase tracking-widest">
                Palabras
              </label>
              <span
                className={`text-lg tabular-nums ${
                  short ? 'text-slate-500' : full ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {counter}
                {short && ` · mínimo ${CATEGORY_LIMITS.minPalabras}`}
                {full && ' · tope alcanzado'}
              </span>
            </div>
            <textarea
              id="cat-palabras"
              value={draft.raw}
              onChange={(e) => setDraft((d) => ({ ...d, raw: e.target.value }))}
              rows={7}
              placeholder={'Una por línea, o separadas por comas:\n\npizarrón\nproyector\ncafetera, grapadora'}
              className="w-full px-4 py-3 text-xl bg-slate-900 text-white border-2 border-cyan-700 placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-colors resize-y"
            />
            <p className="text-slate-500 text-base">
              Se ignoran las repetidas y las líneas vacías. Máximo{' '}
              {CATEGORY_LIMITS.maxPalabras} palabras.
            </p>
            {palabras.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                {palabras.map((w) => (
                  <span
                    key={w}
                    className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-base"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </section>

          {error && (
            <p className="bg-pink-600/20 border-2 border-pink-500 text-pink-100 text-lg p-3">
              ⚠️ {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-t-2 border-slate-700 shrink-0">
          <button
            onClick={onClose}
            className="sm:flex-1 py-3 px-6 bg-slate-700 text-white text-xl font-bold hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={problem !== null}
            title={problem ?? undefined}
            className="sm:flex-[2] flex items-center justify-center gap-2 py-3 px-6 bg-pink-600 text-white text-xl font-bold hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={24} strokeWidth={3} />
            {editing ? 'Guardar y jugar con ella' : 'Crear y jugar con ella'}
          </button>
        </footer>
      </div>
    </div>
  );
}
