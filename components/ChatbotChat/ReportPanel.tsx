  segmentationMask?: string; // 病害切割遮罩 (base64)
  diseaseDescription?: string; // 病害描述
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
            <div>
              {latest.image ? (
                <img
                  src={latest.image}
                  alt="plant"
                  style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: 80,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af"
                }}>
                  无图片
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>{latest.type}</Tag>
                {latest.plantId && <Tag style={{ borderRadius: 999, margin: 0 }}>植株 {latest.plantId}</Tag>}
                {latest.provider && <Tag style={{ borderRadius: 999, margin: 0 }}>{latest.provider}</Tag>}
                {latest.model && <Tag style={{ borderRadius: 999, margin: 0 }}>{latest.model}</Tag>}
                <div style={{ color: "#9ca3af", fontSize: 12, marginLeft: "auto" }}>
                  {new Date(latest.ts).toLocaleString()}
                </div>
              </div>
              {latest.content && (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {latest.content}
                </div>
              )}
              {!latest.content && latest.analysis && (
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {JSON.stringify(latest.analysis, null, 2)}
                </pre>
              )}
              {!latest.content && !latest.analysis && latest.data && (
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {JSON.stringify(latest.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
          
          {/* 病害切割遮罩显示 */}
          {latest.segmentationMask && (
            <div style={{ 
              borderTop: "1px solid rgba(255,255,255,0.08)", 
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Tag color="purple" style={{ borderRadius: 999, margin: 0 }}>
                  🎯 UniPixel-3B 病害切割
                </Tag>
                {latest.diseaseDescription && (
                  <div style={{ 
                    fontSize: 12, 
                    color: "#a78bfa",
                    backgroundColor: "rgba(167, 139, 250, 0.1)",
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid rgba(167, 139, 250, 0.2)"
                  }}>
                    切割关键词: "{latest.diseaseDescription}"
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>VLM 诊断自动生成精确关键词 → UniPixel-3B (WSL FastAPI) 切割</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {latest.image && (
                  <div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>原始图像</div>
                    <img
                      src={latest.image}
                      alt="original"
                      style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 4 }}>病害区域遮罩</div>
                  <img
                    src={latest.segmentationMask}
                    alt="segmentation mask"
                    style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(167, 139, 250, 0.3)" }}
                  />
                </div>
              </div>
            </div>
          )}
