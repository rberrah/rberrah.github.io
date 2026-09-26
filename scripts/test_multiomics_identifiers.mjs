import assert from 'node:assert/strict';
import {
  resolveMetaboliteIdentifier,
  resolveMetaboliteIdentifiers
} from '../src/lib/multiomics/deterministic.js';

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// HMDB -> ChEBI must use an explicit UniChem source-to-source mapping.
{
  const seen = [];
  const fetchFn = async (input) => {
    const url = String(input);
    seen.push(url);
    assert.match(url, /unichem\/rest\/src_compound_id\/HMDB0015623\/18\/7$/);
    return jsonResponse([{ src_compound_id: 'CHEBI:34967' }]);
  };
  const result = await resolveMetaboliteIdentifier('HMDB0015623', { fetchFn, identifierType: 'hmdb' });
  assert.equal(result.resolved, 'CHEBI:34967');
  assert.equal(result.status, 'resolved_external_id');
  assert.equal(result.method, 'unichem_hmdb_to_chebi');
  assert.equal(seen.length, 1);
}

// KEGG Compound is no longer routed through the retired UniChem KEGG source.
// A ChEBI search is accepted only when it returns one unique ChEBI accession.
{
  const fetchFn = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, 'www.ebi.ac.uk');
    assert.match(url.pathname, /chebi\/backend\/api\/public\/es_search/);
    assert.equal(url.searchParams.get('term'), 'C07430');
    return jsonResponse({
      results: [{
        _source: {
          chebi_accession: 'CHEBI:8060',
          name: 'example',
          ascii_name: 'example',
          stars: 3
        }
      }]
    });
  };
  const result = await resolveMetaboliteIdentifier('C07430', { fetchFn, identifierType: 'kegg_compound' });
  assert.equal(result.resolved, 'CHEBI:8060');
  assert.equal(result.status, 'resolved_external_id');
  assert.equal(result.method, 'chebi_exact_kegg_xref_search');
}

// Multiple ChEBI hits for one KEGG identifier remain ambiguous instead of
// silently choosing the first search result.
{
  const fetchFn = async () => jsonResponse({
    results: [
      { _source: { chebi_accession: 'CHEBI:111', name: 'a', ascii_name: 'a' } },
      { _source: { chebi_accession: 'CHEBI:222', name: 'b', ascii_name: 'b' } }
    ]
  });
  const result = await resolveMetaboliteIdentifier('C99999', { fetchFn, identifierType: 'kegg_compound' });
  assert.equal(result.resolved, null);
  assert.equal(result.status, 'ambiguous');
  assert.equal(result.method, 'chebi_exact_kegg_xref_search');
  assert.deepEqual(result.candidates, ['CHEBI:111', 'CHEBI:222']);
}

// Numeric PubChem CIDs are mapped only when the identifier type explicitly says PubChem.
{
  const fetchFn = async (input) => {
    const url = String(input);
    assert.match(url, /unichem\/rest\/src_compound_id\/3675\/22\/7$/);
    return jsonResponse([{ src_compound_id: 'CHEBI:8060' }]);
  };
  const result = await resolveMetaboliteIdentifier('3675', { fetchFn, identifierType: 'pubchem' });
  assert.equal(result.resolved, 'CHEBI:8060');
  assert.equal(result.method, 'unichem_pubchem_to_chebi');
}

// Multiple structure-equivalent ChEBI identifiers are never silently collapsed to the first hit.
{
  const fetchFn = async (input) => {
    const url = String(input);
    assert.match(url, /unichem\/rest\/src_compound_id\/HMDB9999999\/18\/7$/);
    return jsonResponse([
      { src_compound_id: 'CHEBI:111' },
      { src_compound_id: 'CHEBI:222' }
    ]);
  };
  const result = await resolveMetaboliteIdentifier('HMDB9999999', { fetchFn, identifierType: 'hmdb' });
  assert.equal(result.resolved, null);
  assert.equal(result.status, 'ambiguous');
  assert.deepEqual(result.candidates, ['CHEBI:111', 'CHEBI:222']);
}

// Plain metabolite names continue to use conservative exact ChEBI name matching.
{
  const fetchFn = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, 'www.ebi.ac.uk');
    assert.match(url.pathname, /chebi\/backend\/api\/public\/es_search/);
    assert.equal(url.searchParams.get('term'), 'linoleic acid');
    return jsonResponse({
      results: [{
        _source: {
          chebi_accession: 'CHEBI:17351',
          name: 'linoleic acid',
          ascii_name: 'linoleic acid',
          stars: 3
        }
      }]
    });
  };
  const result = await resolveMetaboliteIdentifier('linoleic acid', { fetchFn, identifierType: 'name' });
  assert.equal(result.resolved, 'CHEBI:17351');
  assert.equal(result.status, 'resolved');
}

// Batch mapping reports ambiguous and unresolved counts without forcing mappings.
{
  const fetchFn = async (input) => {
    const url = String(input);
    if (url.includes('/HMDB0000001/18/7')) return jsonResponse([{ src_compound_id: 'CHEBI:1' }]);
    if (url.includes('/HMDB0000002/18/7')) return jsonResponse([]);
    return jsonResponse([], 404);
  };
  const result = await resolveMetaboliteIdentifiers(
    ['HMDB0000001', 'HMDB0000002'],
    { fetchFn, identifierType: 'hmdb', maxQueries: 5 }
  );
  assert.equal(result.resolvedCount, 1);
  assert.equal(result.unresolvedCount, 1);
}

console.log('multiomics strict chemical identifier mapping: PASS');
