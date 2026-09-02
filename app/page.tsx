import type { AnchorHTMLAttributes, ReactNode } from 'react';

/* oxlint-disable next/no-img-element -- Studio logos are pre-sized 128px WebP assets; next/image adds runtime code without reducing their transfer size. */

const pathHighlights = {
  os: ['Rust', 'rCore', 'OpenCamp'],
  rdma: ['RDMA101', 'Mooncake', 'Verbs'],
};

const actionLinkClass =
  'action-link group/button inline-flex shrink-0 items-center justify-center gap-1.5 border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px';

interface ActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

function ActionLink({ className = '', children, ...props }: ActionLinkProps) {
  return (
    <a
      data-slot="button"
      className={`${actionLinkClass} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

function ArrowIcon({
  direction,
}: {
  direction: 'right' | 'down-right' | 'up-right';
}) {
  return (
    <svg
      aria-hidden="true"
      data-icon="inline-end"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'right' && (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
      {direction === 'down-right' && (
        <>
          <path d="m7 7 10 10" />
          <path d="M17 7v10H7" />
        </>
      )}
      {direction === 'up-right' && (
        <>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </>
      )}
    </svg>
  );
}

function SparkMark() {
  return (
    <span className="spark-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Home() {
  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-background text-foreground"
    >
      <header className="site-header">
        <a href="#top" className="brand" aria-label="光点计划首页">
          <SparkMark />
          <span>光点计划</span>
        </a>

        <nav className="site-nav" aria-label="主导航">
          <a href="#paths">活动方向</a>
          <a href="#about">如何参与</a>
          <a href="#campus">校内支持</a>
        </nav>

        <ActionLink
          href="/rank/"
          aria-label="查看学习进度"
          className="site-header-action"
        >
          学习进度 <ArrowIcon direction="right" />
        </ActionLink>
      </header>

      <section className="hero-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            UESTC · 光点计划 IV · 2026
          </div>

          <h1 id="hero-title">
            让对系统的<span className="accent-word">好奇</span>，
            <br />
            有地方发生。
          </h1>

          <p className="hero-lede">
            光点计划面向对计算机系统感兴趣的校内同学。2026 年设 OS 与 RDMA
            两个方向，可以选择其一，也可以同时参加。
          </p>

          <div className="hero-actions">
            <ActionLink
              href="#os"
              aria-label="查看 OS 方向"
              className="h-14 rounded-full bg-blue px-7 text-base !text-white shadow-[0_10px_30px_rgba(42,78,246,.18)] hover:bg-blue/90"
            >
              查看 OS 方向 <ArrowIcon direction="down-right" />
            </ActionLink>
            <ActionLink
              href="#rdma"
              aria-label="查看 RDMA 方向"
              className="rdma-cta h-14 rounded-full px-7 text-base shadow-[0_10px_30px_rgba(8,118,108,.18)]"
            >
              查看 RDMA 方向 <ArrowIcon direction="down-right" />
            </ActionLink>
          </div>
        </div>

        <div className="system-visual" aria-label="OS 与 RDMA 学习方向示意图">
          <div className="visual-note visual-note-top">
            <span>01</span>
            READ
          </div>
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="visual-core">
            <SparkMark />
            <strong>
              LEARN BY
              <br />
              BUILDING
            </strong>
          </div>
          <div className="path-node path-node-os">
            <span className="node-index">A</span>
            <span>
              <b>OS</b>
              <small>MATERIAL · rCore</small>
            </span>
          </div>
          <div className="path-node path-node-rdma">
            <span className="node-index">B</span>
            <span>
              <b>RDMA</b>
              <small>MATERIAL · RDMA101</small>
            </span>
          </div>
          <div className="floating-code code-a">
            one-sided op, two-sided pain
          </div>
          <div className="floating-code code-b">works on my machine</div>
          <div className="visual-note visual-note-bottom">
            <span>02</span>
            BUILD
          </div>
        </div>
      </section>

      <div className="manifesto-strip" aria-label="项目学习方式">
        <span>READ THE CODE</span>
        <i />
        <span>ASK BETTER QUESTIONS</span>
        <i />
        <span>BUILD THE SYSTEM</span>
      </div>

      <section
        id="paths"
        className="paths-section"
        aria-labelledby="paths-title"
      >
        <div className="section-heading">
          <p className="section-kicker">01 / DIRECTIONS</p>
          <h2 id="paths-title" className="section-title">
            两个方向，两个起点。
          </h2>
        </div>

        <div className="path-grid">
          <article id="os" className="path-card path-card-os">
            <div className="path-card-topline">
              <span>方向 01</span>
              <span className="coming-pill">课程已开放</span>
            </div>
            <div>
              <p className="path-question">
                操作系统如何接管硬件，
                <br />
                并为程序提供运行环境？
              </p>
              <h3>OS</h3>
              <p className="path-material">学习材料 · rCore</p>
              <p className="path-description">
                OS 方向使用基于 Rust 的 rCore
                作为学习材料，课程与实验来自清华大学开源操作系统训练营。光点计划在校内推广这项活动，并为参与者提供学习和交流支持。
              </p>
            </div>
            <div className="path-card-footer">
              <ul className="path-tags" aria-label="rCore 学习关键词">
                {pathHighlights.os.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="path-card-links">
                <ActionLink
                  href="https://github.com/uestc-workshop-os-camp"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="查看校内活动仓库"
                  className="path-link-button h-11 rounded-full bg-ink px-5 !text-white hover:bg-blue"
                >
                  校内活动仓库 <ArrowIcon direction="up-right" />
                </ActionLink>
                <ActionLink
                  href="https://opencamp.cn/os2edu/camp/2026spring"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="查看 OpenCamp"
                  className="path-link-button h-11 rounded-full border-ink/20 bg-white/25 px-5 hover:bg-white/55"
                >
                  查看 OpenCamp <ArrowIcon direction="up-right" />
                </ActionLink>
              </div>
            </div>
          </article>

          <article id="rdma" className="path-card path-card-rdma">
            <div className="path-card-topline">
              <span>方向 02 · 2026 新探索</span>
              <span className="coming-pill">教程已开放 · 实验开发中</span>
            </div>
            <div>
              <p className="path-question">
                一段数据从这台机器到另一台机器，
                <br />
                时间都花在了哪里？
              </p>
              <h3>RDMA</h3>
              <p className="path-material">学习材料 · RDMA101</p>
              <p className="path-description">
                RDMA 方向采用 RDMA101 学习材料。这是一份由{' '}
                <a
                  className="author-link"
                  href="https://renfeng.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  Feng Ren
                </a>{' '}
                编写、源于 Mooncake Transfer Engine
                工程实践的教程。它面向希望理解、使用、运维或开发 RDMA
                系统的读者，旨在提供一条相对完整的学习路径。配套实验正在开发中。
              </p>
            </div>
            <div className="path-card-footer">
              <ul className="path-tags" aria-label="RDMA 学习关键词">
                {pathHighlights.rdma.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ActionLink
                href="https://renfeng.org/RDMA101/"
                target="_blank"
                rel="noreferrer"
                aria-label="阅读 RDMA101"
                className="path-link-button h-11 rounded-full bg-ink px-5 !text-white hover:bg-blue"
              >
                阅读 RDMA101 <ArrowIcon direction="up-right" />
              </ActionLink>
            </div>
          </article>
        </div>
      </section>

      <section
        id="about"
        className="method-section"
        aria-labelledby="method-title"
      >
        <div className="method-intro">
          <p className="section-kicker">02 / HOW IT WORKS</p>
          <h2 id="method-title" className="section-title">
            跟着材料动手，
            <br />
            带着问题讨论。
          </h2>
          <p>
            两个方向按各自的课程或教程推进。光点计划提供校内学习与交流支持，具体安排随活动进度更新。
          </p>
        </div>

        <ol className="method-steps">
          <li>
            <span className="step-no">01</span>
            <h3>选择方向</h3>
            <small>OS、RDMA，或同时参加</small>
          </li>
          <li>
            <span className="step-no">02</span>
            <h3>跟随材料</h3>
            <small>按课程或教程向下推进</small>
          </li>
          <li>
            <span className="step-no">03</span>
            <h3>参与讨论</h3>
            <small>带着代码、现象和问题来</small>
          </li>
        </ol>
      </section>

      <section className="club-section" aria-labelledby="club-title">
        <div className="club-statement">
          <p className="section-kicker">03 / COMMUNITY</p>
          <h2 id="club-title" className="section-title">
            技术很硬，
            <br />
            学习体验不必生硬。
          </h2>
        </div>

        <div className="club-board" aria-label="光点计划的学习价值">
          <div className="board-orbit" aria-hidden="true">
            <span className="board-dot board-dot-one" />
            <span className="board-dot board-dot-two" />
            <span className="board-dot board-dot-three" />
            <span className="board-dot board-dot-inner" />
          </div>
          <p className="board-big">
            SYSTEMS
            <br />
            IN PRACTICE.
          </p>
          <div className="board-note note-one">
            <span>01</span>
            <b>读到细处</b>
            <small>不绕开源码和机制</small>
          </div>
          <div className="board-note note-two">
            <span>02</span>
            <b>问到具体</b>
            <small>让讨论回到代码和现象</small>
          </div>
          <div className="board-note note-three">
            <span>03</span>
            <b>留下记录</b>
            <small>把走过的路写下来</small>
          </div>
        </div>
      </section>

      <section
        id="campus"
        className="campus-section"
        aria-labelledby="campus-title"
      >
        <div className="campus-heading">
          <p className="section-kicker">04 / ROOTED IN UESTC</p>
          <div className="campus-narrative">
            <h2 id="campus-title" className="section-title">
              探索计算机系统，不止于一次活动。
            </h2>
            <div className="campus-copy">
              <p>
                光点计划由电子科技大学的四个工作室联合发起。我们把公开的学习材料、校内的实践机会和愿意一起讨论的人聚到这里，希望每个对计算机系统感兴趣的同学，都能找到一个清楚的起点。
              </p>
              <p>
                活动期间，四个工作室提供学习和交流支持。活动结束后，想继续深入的同学可以参加工作室招新，也可以参与后续活动的建设。
              </p>
            </div>
          </div>
        </div>
        <ul className="studio-grid" aria-label="联合举办光点计划的校内工作室">
          <li>
            <a
              href="https://www.glimmer.org.cn/"
              target="_blank"
              rel="noreferrer"
              aria-label="访问微光工作室网站"
            >
              <img
                src="/studios/glimmer.webp"
                alt=""
                width="52"
                height="52"
                loading="lazy"
                decoding="async"
              />
              <b>微光工作室</b>
              <ArrowIcon direction="up-right" />
            </a>
          </li>
          <li>
            <a
              href="https://uestc404.github.io/Embedded-Studio/"
              target="_blank"
              rel="noreferrer"
              aria-label="访问嵌入式工作室网站"
            >
              <img
                src="/studios/embedded.webp"
                alt=""
                width="52"
                height="52"
                loading="lazy"
                decoding="async"
              />
              <b>嵌入式工作室</b>
              <ArrowIcon direction="up-right" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/uestc-yolo-studio"
              target="_blank"
              rel="noreferrer"
              aria-label="访问 YOLO 工作室 GitHub"
            >
              <img
                src="/studios/yolo.webp"
                alt=""
                width="52"
                height="52"
                loading="lazy"
                decoding="async"
              />
              <b>YOLO 工作室</b>
              <ArrowIcon direction="up-right" />
            </a>
          </li>
          <li>
            <a
              href="https://recruit.yilu-studio.cn/"
              target="_blank"
              rel="noreferrer"
              aria-label="访问一路工作室网站"
            >
              <img
                src="/studios/yilu.webp"
                alt=""
                width="52"
                height="52"
                loading="lazy"
                decoding="async"
              />
              <b>一路工作室</b>
              <ArrowIcon direction="up-right" />
            </a>
          </li>
        </ul>
      </section>

      <section className="closing-section" aria-labelledby="closing-title">
        <div className="closing-orbits" aria-hidden="true">
          <span className="closing-arc closing-arc-one" />
          <span className="closing-arc closing-arc-two" />
          <span className="closing-arc closing-arc-three" />
          <span className="closing-node closing-node-one" />
          <span className="closing-node closing-node-two" />
        </div>
        <div className="closing-badge">
          <SparkMark />
          <span>SPARK INITIATIVE IV</span>
        </div>
        <h2 id="closing-title">
          <span>从这里开始，</span>
          <span>构建你的系统。</span>
        </h2>
        <p>光点计划 IV · 2026 · UESTC</p>
        <div className="closing-actions">
          <ActionLink
            href="#os"
            aria-label="查看 OS 方向"
            className="h-14 rounded-full bg-blue px-7 text-base !text-white hover:bg-blue/90"
          >
            查看 OS 方向 <ArrowIcon direction="up-right" />
          </ActionLink>
          <ActionLink
            href="#rdma"
            aria-label="查看 RDMA 方向"
            className="rdma-cta h-14 rounded-full px-7 text-base"
          >
            查看 RDMA 方向 <ArrowIcon direction="up-right" />
          </ActionLink>
        </div>
      </section>

      <footer className="site-footer">
        <a href="#top" className="brand">
          <SparkMark />
          <span>光点计划</span>
        </a>
        <div>
          <span>© 2023–2026 光点计划团队</span>
        </div>
      </footer>
    </main>
  );
}
