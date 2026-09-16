// Tuple encoding keeps delimiters inside either field from colliding.
export const logicalRecordKey = (record) => JSON.stringify([record.record_id, record.district]);

// A filter selects search cards; it must not shrink a project's real area scope.
export function indexCanonicalDistricts(records, validDistricts) {
  const valid = new Set(validDistricts);
  const districtsByIdentity = new Map();
  for (const record of records) {
    const identity = record.canonical_view_id || record.view_id;
    const districts = districtsByIdentity.get(identity) || new Set();
    for (const name of [...(record.related_districts || []), record.district]) {
      if (valid.has(name)) districts.add(name);
    }
    districtsByIdentity.set(identity, districts);
  }
  return new Map([...districtsByIdentity].map(([identity, districts]) => [identity, [...districts]]));
}

/**
 * Merge the lightweight area index with the complete searchable records.
 *
 * The area index and the detail shards can contain two presentation variants
 * of the same logical budget record. The area variant keeps the public route
 * and district context, while the detail variant contributes the richer
 * document fields. Once enriched, only one variant may remain in the search
 * graph; otherwise the same amount is attached to its parent twice.
 */
export const mergeUniqueSearchRecords = (records, details) => {
  const detailByScope = new Map(details.map((item) => [logicalRecordKey(item), item]));
  const detailById = new Map();

  details.forEach((item) => {
    const variants = detailById.get(item.record_id) || [];
    variants.push(item);
    detailById.set(item.record_id, variants);
  });

  const areaViewIds = new Set(records.map((item) => item.view_id));
  const enrichedAreaRecords = records.map((item) => {
    const variants = detailById.get(item.record_id) || [];
    const uniqueFallback = variants.length === 1 && !variants[0].view_role ? variants[0] : null;
    const detail = detailByScope.get(logicalRecordKey(item)) || uniqueFallback;
    return detail ? { ...detail, ...item, view_id: item.view_id } : item;
  });

  const representedLogicalRecords = new Set(enrichedAreaRecords.map(logicalRecordKey));
  const unrepresentedDetails = details.filter((item) => (
    !areaViewIds.has(item.view_id)
    && !representedLogicalRecords.has(logicalRecordKey(item))
  ));

  return [...enrichedAreaRecords, ...unrepresentedDetails];
};
