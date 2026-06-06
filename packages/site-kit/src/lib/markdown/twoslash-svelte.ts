// @ts-nocheck

import { createRequire } from 'node:module';
import { decode } from '@jridgewell/sourcemap-codec';
import { SourceMap } from '@volar/language-core';
import { svelte2tsx } from 'svelte2tsx';
import { createTwoslasher as createTwoslasher$1, defaultCompilerOptions, defaultHandbookOptions, findQueryMarkers, findFlagNotations } from 'twoslash';
import { createPositionConverter, removeCodeRanges, resolveNodePositions } from 'twoslash-protocol';
import ts from 'typescript';

function createTwoslasher(createOptions = {}) {
  const require = createRequire(import.meta.url);
  const twoslasherBase = createTwoslasher$1(createOptions);
  function twoslasher(code, extension, options = {}) {
    if (extension !== "svelte") {
      return twoslasherBase(code, extension, options);
    }
    const compilerOptions = {
      ...defaultCompilerOptions,
      ...options.compilerOptions
    };
    const handbookOptions = {
      ...defaultHandbookOptions,
      noErrorsCutted: true,
      ...options.handbookOptions
    };
    const sourceMeta = findQueryMarkers(code, {
      removals: [],
      positionCompletions: [],
      positionQueries: [],
      positionHighlights: []
    }, createPositionConverter(code));
    const customTags = options.customTags ?? createOptions.customTags ?? [];
    const optionDeclarations = ts.optionDeclarations;
    const flagNotations = findFlagNotations(code, customTags, optionDeclarations);
    for (const flag of flagNotations) {
      switch (flag.type) {
        case "unknown": {
          continue;
        }
        case "compilerOptions": {
          compilerOptions[flag.name] = flag.value;
          break;
        }
        case "handbookOptions": {
          handbookOptions[flag.name] = flag.value;
          break;
        }
      }
      sourceMeta.removals.push([flag.start, flag.end]);
    }
    let strippedCode = code;
    for (const [start, end] of sourceMeta.removals) {
      strippedCode = strippedCode.slice(0, start) + strippedCode.slice(start, end).replace(/\S/g, " ") + strippedCode.slice(end);
    }
    const compiled = svelte2tsx(strippedCode);
    const map = generateSourceMap(strippedCode, compiled.code, compiled.map.mappings);
    function getLastGeneratedOffset(pos) {
      const offsets = [...map.toGeneratedLocation(pos)];
      if (!offsets.length) {
        return void 0;
      }
      return offsets[offsets.length - 1]?.[0];
    }
    const result = twoslasherBase(compiled.code, "tsx", {
      ...options,
      compilerOptions: {
        ...compilerOptions,
        types: [
          ...compilerOptions.types ?? [],
          require.resolve(`svelte2tsx/svelte-jsx-v4.d.ts`),
          require.resolve(`svelte2tsx/svelte-shims-v4.d.ts`)
        ]
      },
      handbookOptions: {
        ...handbookOptions,
        keepNotations: true
      },
      positionCompletions: sourceMeta.positionCompletions.map((p) => getLastGeneratedOffset(p)),
      positionQueries: sourceMeta.positionQueries.map((p) => get(map.toGeneratedLocation(p), 0)?.[0]).filter((value) => value != null),
      positionHighlights: sourceMeta.positionHighlights.map(([start, end]) => [
        get(map.toGeneratedLocation(start), 0)?.[0],
        get(map.toGeneratedLocation(end), 0)?.[0]
      ]).filter((x) => x[0] != null && x[1] != null)
    });
    if (createOptions.debugShowGeneratedCode) {
      return result;
    }
    const mappedNodes = result.nodes.map((node) => {
      if ("text" in node && node.text === "any") {
        return void 0;
      }
      const startMap = get(map.toSourceLocation(node.start), 0);
      if (!startMap) {
        return void 0;
      }
      const start = startMap[0];
      let end = get(map.toSourceLocation(node.start + node.length), 0)?.[0];
      if (end == null && startMap[1].sourceOffsets[0] === startMap[0]) {
        end = startMap[1].sourceOffsets[1];
      }
      if (end == null || start < 0 || end < 0 || start > end) {
        return void 0;
      }
      return {
        ...node,
        target: code.slice(start, end),
        start: startMap[0],
        length: end - start
      };
    }).filter((value) => value != null);
    const mappedRemovals = [
      ...sourceMeta.removals,
      ...result.meta.removals.map((r) => {
        const start = get(map.toSourceLocation(r[0]), 0)?.[0] ?? code.match(/(?<=<script[\s\S]*>\s)/)?.index;
        const end = get(map.toSourceLocation(r[1]), 0)?.[0];
        if (start == null || end == null || start < 0 || end < 0 || start >= end) {
          return void 0;
        }
        return [start, end];
      }).filter((value) => value != null)
    ];
    if (!options.handbookOptions?.keepNotations) {
      const removed = removeCodeRanges(code, mappedRemovals, mappedNodes);
      result.code = removed.code;
      result.meta.removals = removed.removals;
      result.nodes = resolveNodePositions(removed.nodes, result.code);
    } else {
      result.code = code;
      result.meta.removals = mappedRemovals;
    }
    result.nodes = result.nodes.filter((node, index) => {
      const next = result.nodes[index + 1];
      if (!next) {
        return true;
      }
      if (next.type === node.type && next.start === node.start) {
        return false;
      }
      return true;
    });
    result.meta.extension = "svelte";
    return result;
  }
  twoslasher.getCacheMap = twoslasherBase.getCacheMap;
  return twoslasher;
}
const createTwoslasherSvelte = createTwoslasher;
function get(iterator, index) {
  for (const item of iterator) {
    if (index-- === 0)
      return item;
  }
  return void 0;
}
function generateSourceMap(sourceCode, generatedCode, encodedMappings) {
  const generatedPositionConverter = createPositionConverter(generatedCode);
  const sourcePositionConverter = createPositionConverter(sourceCode);
  const decodedMappings = decode(encodedMappings);
  const mappings = [];
  let current;
  for (let genLine = 0; genLine < decodedMappings.length; genLine++) {
    for (const segment of decodedMappings[genLine]) {
      const genCharacter = segment[0];
      const genOffset = generatedPositionConverter.posToIndex(genLine, genCharacter);
      if (current) {
        let length = genOffset - current.genOffset;
        const sourceText = sourceCode.substring(current.sourceOffset, current.sourceOffset + length);
        const genText = generatedCode.substring(current.genOffset, current.genOffset + length);
        if (sourceText !== genText) {
          length = 0;
          for (let i = 0; i < genOffset - current.genOffset; i++) {
            if (sourceText[i] === genText[i]) {
              length = i + 1;
            } else {
              break;
            }
          }
        }
        if (length > 0) {
          const lastMapping = mappings.length ? mappings[mappings.length - 1] : void 0;
          if (lastMapping && lastMapping.generatedOffsets[0] + lastMapping.lengths[0] === current.genOffset && lastMapping.sourceOffsets[0] + lastMapping.lengths[0] === current.sourceOffset) {
            lastMapping.lengths[0] += length;
          } else {
            mappings.push({
              sourceOffsets: [current.sourceOffset],
              generatedOffsets: [current.genOffset],
              lengths: [length],
              data: {
                verification: true,
                completion: true,
                semantic: true,
                navigation: true,
                structure: true,
                format: false
              }
            });
          }
        }
        current = void 0;
      }
      if (segment[2] !== void 0 && segment[3] !== void 0) {
        const sourceOffset = sourcePositionConverter.posToIndex(segment[2], segment[3]);
        current = {
          genOffset,
          sourceOffset
        };
      }
    }
  }
  return new SourceMap(mappings);
}

export { createTwoslasher, createTwoslasherSvelte };
