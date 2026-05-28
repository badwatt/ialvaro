import experienceData from "src/data/experience.json";
import skillsData from "src/data/skills.json";
import biographyData from "src/data/biography.json";

const bioText =
  biographyData.find((b) => b.id === "3")?.bio ||
  biographyData[0]?.bio ||
  "";

const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);

type Props = { domain: string };

export const CVPreviewContent = ({ domain }: Props) => (
  <div className="w-full min-h-full bg-[#08080f] text-[#e8e8f2] p-8 md:p-10 font-sans">
    {/* Header */}
    <div className="border-b border-[#202035] pb-5 mb-6">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#e8e8f2]">
        Alvaro Garcia Macias
      </h1>
      <p className="text-sm text-[#5b9bd5] mt-1.5 tracking-widest uppercase font-semibold">
        Full Stack Developer
      </p>
      <div className="flex gap-5 mt-3 text-xs">
        <a
          href="https://github.com/badwatt"
          target="_blank"
          rel="noreferrer"
          className="text-[#5b9bd5] hover:underline"
        >
          github.com/badwatt
        </a>
        <a
          href="https://linkedin.com/in/alvaro-garcia-macias"
          target="_blank"
          rel="noreferrer"
          className="text-[#5b9bd5] hover:underline"
        >
          linkedin.com/in/alvaro-garcia-macias
        </a>
      </div>
    </div>

    <div className="flex flex-row gap-8">
      {/* Sidebar */}
      <div className="w-40 shrink-0 space-y-6">
        <img
          src="/images/profile/profile.png"
          alt="Alvaro Garcia Macias"
          className="w-24 h-24 md:w-[100px] md:h-[100px] rounded-full border-2 border-[#5b9bd5] mx-auto object-cover"
        />

        <div>
          <h2 className="text-xs font-bold text-[#5b9bd5] uppercase tracking-widest border-b border-[#202035] pb-1 mb-2.5">
            About
          </h2>
          <p className="text-[10px] md:text-xs text-[#9898b0] leading-relaxed whitespace-pre-line">
            {bioText}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold text-[#5b9bd5] uppercase tracking-widest border-b border-[#202035] pb-1 mb-2.5">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1">
            {featuredSkills.map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 bg-[#5b9bd5] text-[#08080f] rounded font-bold"
              >
                {s}
              </span>
            ))}
            {otherSkills.map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 bg-[#12121d] text-[#e8e8f2] border border-[#202035] rounded"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-xs font-bold text-[#5b9bd5] uppercase tracking-widest border-b border-[#202035] pb-1 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experienceData.map((job) => (
              <div key={job.id}>
                <h3 className="text-sm font-bold text-[#e8e8f2]">{job.title}</h3>
                <p className="text-[10px] text-[#9898b0] mt-0.5 mb-1.5">
                  {job.date_from} — {job.date_to}
                </p>

                {job.description.title.one && (
                  <div className="mt-1">
                    <p className="text-[10px] font-bold text-[#e8e8f2]">{job.description.title.one}</p>
                    <p className="text-[10px] text-[#9898b0] leading-relaxed whitespace-pre-line">
                      {job.description.content.one}
                    </p>
                  </div>
                )}

                {job.description.title.two && (
                  <div className="mt-1">
                    <p className="text-[10px] font-bold text-[#e8e8f2]">{job.description.title.two}</p>
                    <p className="text-[10px] text-[#9898b0] leading-relaxed whitespace-pre-line">
                      {job.description.content.two}
                    </p>
                  </div>
                )}

                {job.description.title.four && (
                  <div className="mt-1">
                    <p className="text-[10px] font-bold text-[#e8e8f2]">{job.description.title.four}</p>
                    <p className="text-[10px] text-[#9898b0] leading-relaxed whitespace-pre-line">
                      {job.description.content.four}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between border-t border-[#202035] pt-2 mt-6">
      <p className="text-[8px] text-[#9898b0]">Generated from {domain}</p>
      <div className="flex items-center gap-2">
        <span className="text-[8px] text-[#9898b0]">{new Date().getFullYear()}</span>
        <img
          src="/images/profile/profile_alt.png"
          alt=""
          className="w-8 h-8 rounded-full border border-[#5b9bd5] object-cover"
        />
      </div>
    </div>
  </div>
);