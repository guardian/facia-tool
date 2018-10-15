type Path = {
  id: string;
  index: number;
  type: string;
  childrenField?: string;
};

const elEq = (a: Path, b: Path, checkChildren: boolean = false) => {
  const { index: i1, type: t1, childrenField: c1 } = a;
  const { index: i2, type: t2, childrenField: c2 } = b;

  // we're still a sub path if the we're on the last and it doesn't have a
  // childrenField
  return (
    !Number.isNaN(i1) &&
    i1 === i2 &&
    (!!t1 && t1 === t2) &&
    (c1 === c2 || !checkChildren)
  );
};

const eq = (a: Path[], b: Path[]) =>
  a.length === b.length &&
  a.every((el, i) => elEq(el, b[i], i !== a.length - 1));

const isSubPath = (path: Path[], candidate: Path[]) =>
  candidate.length > path.length &&
  !!path.length &&
  path.every((el, i) => elEq(el, candidate[i], i !== path.length - 1));

const isSibling = (path: Path[], candidate: Path[]) =>
  candidate.length === path.length &&
  !path.some((el, i) => {
    const { index: i1, type: t1, childrenField: c1 } = el;
    const { index: i2, type: t2, childrenField: c2 } = candidate[i];

    // we're still a sub path if the we're on the last and it doesn't have a
    // childrenField
    return (
      (!Number.isNaN(i1) && i1 !== i2) ||
      (t1 && t1 !== t2) ||
      (i === path.length - 1 ? c1 === c2 : c1 !== c2)
    );
  });

const pathForMove = (source: Path[], target: Path[]) => {
  const newPath = [];

  for (let i = 0; i < target.length; i += 1) {
    const targetPathSpec = target[i];
    const {
      id: kt,
      index: it,
      type: tt,
      childrenField: ct
    } = targetPathSpec || {
      id: null,
      index: null,
      type: null,
      childrenField: null
    };
    const { index: is, childrenField: cs } = source[i] || {
      index: null,
      childrenField: null
    };

    if (i < source.length - 1 && (is !== it || ct !== cs)) {
      return target;
    } else if (i === source.length - 1 && ct === cs && is < it) {
      newPath.push({ id: kt, index: it - 1, type: tt, childrenField: ct });
    } else {
      newPath.push(targetPathSpec);
    }
  }

  return newPath;
};

const hasMoved = (prevPath: Path[], nextPath: Path[]) => {
  if (prevPath.length !== nextPath.length) {
    return true;
  }

  for (let i = 0; i < prevPath.length; i += 1) {
    const { index: i1, childrenField: c1 } = prevPath[i];
    const { index: i2, childrenField: c2 } = nextPath[i];

    if (i < prevPath.length - 1) {
      if (c1 !== c2) {
        return true;
      } else if (i1 !== i2) {
        return true;
      }
    } else {
      if (i2 < i1 || i2 > i1 + 1) {
        return true;
      }
      return false;
    }
  }

  // in case we have empty paths?
  return false;
};

const addOffset = (candidatePath: Path[], offset: number) => {
  const parent = candidatePath[candidatePath.length - 1];
  return [
    ...candidatePath.slice(0, candidatePath.length - 1),
    {
      ...parent,
      index: parent.index + offset
    }
  ];
};

export { Path };

export { isSubPath, isSibling, pathForMove, hasMoved, eq, addOffset };
