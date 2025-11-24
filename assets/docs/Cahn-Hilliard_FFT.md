<h1 align="center">Cahn–Hilliard Equation and Pseudo-Spectral Solution</h1>

<p align="center"><strong>Yazhuo Liu</strong></p>


## 1. Free Energy and Governing Equation

We start with the Ginzburg–Landau free energy functional:

$$
F[c] = \int_\Omega \left[ \frac{\kappa}{2} |\nabla c|^2 + f(c) \right] \, d\boldsymbol{r}
$$

where $\kappa$ is a gradient energy coefficient and $f(c)$ is the bulk free-energy density.  
The variational derivative gives the chemical potential

$$
\mu = \frac{\delta F}{\delta c} = f'(c) - \kappa \nabla^2 c
$$

For a symmetric double-well potential, we take

$$
f'(c) = 10(c-0.05)(c-0.5)(c-0.95)
$$

Hence the Cahn–Hilliard dynamics is

$$
\frac{\partial c}{\partial t}
= \nabla \cdot \left( M \nabla \mu \right)
= M \left[ \nabla^2 f'(c) - \kappa \nabla^4 c \right]
$$

where $M$ is the (constant) mobility.

---

## 2. Fourier Representation

On a periodic domain, the concentration field is expanded in a Fourier series:

$$
c(\boldsymbol r, t) = \frac{1}{L_x L_y} \sum_{\boldsymbol k} \widehat{c}_{\boldsymbol k}(t)
e^{i \boldsymbol k \cdot \boldsymbol r}
$$

with coefficients

$$
\widehat{c}_{\boldsymbol k}(t) =
\int_\Omega c(\boldsymbol r, t)\,
e^{-i \boldsymbol k \cdot \boldsymbol r}\, d\boldsymbol r
$$

Discrete wavenumbers are

$$
k_x = \frac{2\pi m_x}{L_x}, \qquad
k_y = \frac{2\pi m_y}{L_y}
$$

with $m_x, m_y \in \{-N/2,\dots,N/2-1\}$.

Fourier identities:

$$
\mathcal{F}\{\nabla^2 g\}
= -|\boldsymbol k|^2 \widehat g,
\qquad
\mathcal{F}\{\nabla^4 g\}
= |\boldsymbol k|^4 \widehat g
$$

---

## 3. PDE in Fourier Space

Transforming the PDE gives

$$
\frac{\partial \widehat{c}_{\boldsymbol k}}{\partial t}
= M\left[
-|\boldsymbol k|^2 \widehat{f'(c)}
- \kappa |\boldsymbol k|^4 \widehat{c}_{\boldsymbol k}
\right]
$$

For the zero mode $\boldsymbol k = 0$,

$$
\partial_t \widehat{c}_{\mathbf 0} = 0
$$

i.e. conservation of total mass.

---

## 4. Semi-Implicit Euler Time Discretization

We discretize time as $t^n = n\Delta t$.  
Using an implicit–explicit (IMEX) scheme:

$$
\frac{\widehat{c}_{\boldsymbol k}^{\,n+1}
- \widehat{c}_{\boldsymbol k}^{\,n}}
{\Delta t}
=
- M |\boldsymbol k|^2 \widehat{f'(c^n)}
- M \kappa |\boldsymbol k|^4
\widehat{c}_{\boldsymbol k}^{\,n+1}
$$

Rearranging yields the update formula:

$$
\boxed{
\widehat{c}_{\boldsymbol k}^{\,n+1}
=
\frac{
\widehat{c}_{\boldsymbol k}^{\,n}
-
\Delta t \, M |\boldsymbol k|^2
\, \widehat{f'(c^n)}
}
{
1 + \Delta t \, M \kappa |\boldsymbol k|^4
}
}
$$

This scheme damps high-frequency modes via the denominator and preserves the mean concentration exactly.

---

## 5. Pseudo-Spectral Algorithm (One Step)

1. **Inverse FFT**

   $$
   c^n = \mathcal{F}^{-1}\{\widehat{c}^n\}
   $$

2. **Evaluate nonlinearity**

   $$
   g^n = f'(c^n)
   $$

3. **FFT**

   $$
   \widehat{g}^n = \mathcal{F}\{g^n\}
   $$

4. **Update using boxed equation**

    $$
    \widehat{c}_{\boldsymbol k}^{\,n+1}
    =
    \frac{
    \widehat{c}_{\boldsymbol k}^{\,n}
    -
    \Delta t \, M |\boldsymbol k|^2
    \, \widehat{f'(c^n)}
    }
    {
    1 + \Delta t \, M \kappa |\boldsymbol k|^4
    }
    $$

5. **Repeat step 1 to 4**


---

## 6. Practical Notes

- **Aliasing**: use $2/3$ dealiasing to remove spurious high-$k$ contributions from the nonlinear term.

- **Energy monitoring**:

  $$
  F[c] \approx
  \sum f(c)\,\Delta x \Delta y
  +
  \frac{\kappa}{2}
  \sum |\boldsymbol k|^2
  |\widehat{c}_{\boldsymbol k}|^2
  \frac{\Delta x \Delta y}{N_x N_y}
  $$
  
  should decrease over time.

- **Time step**: choose small $\Delta t$ for accuracy (implicit term stabililzes stiff modes).
